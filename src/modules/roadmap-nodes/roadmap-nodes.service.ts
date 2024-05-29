import { PassThrough } from "node:stream";

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { DeleteRootRoadmapDto } from "./dto/delete-root-roadmap-dto";
import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
import GenerateSectionNodeDto from "./dto/generate-section-node.dto";
import getTemplate from "./helpers/get-template";
import sectionPromptTemplate from "./prompts/section-node.promp";
import {
	RoadmapSize,
	RoadmapNode,
	RoadmapNodeDocument,
	RoadmapNodesCollectionName,
} from "./schema/roadmap-nodes.schema";
import { RawRoadmap } from "./types/raw-roadmap";
import getConfiguration from "../../config/configuration";
import { LessonsService } from "../lessons/lessons.service";
import { QuizzesService } from "../quizzes/quizzes.service";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserDocument } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";
@Injectable()
export class RoadmapNodesService {
	gga = new GoogleGenerativeAI(getConfiguration().geminiApiKey);
	gemini: GenerativeModel;
	constructor(
		@InjectModel(RoadmapNode.name) private readonly model: Model<RoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly usersService: UsersService,
		private readonly lessonsService: LessonsService,
		private readonly quizzesService: QuizzesService
	) {
		this.gemini = this.gga.getGenerativeModel({
			model: "gemini-1.5-pro",
			generationConfig: { responseMimeType: "application/json" },
		});
	}

	public async generateRootRoadmap(dto: GenerateRootRoadmapDto): Promise<void> {
		const exists = await this.usersService.checkExistance(dto.user_id);
		if (!exists) throw new NotFoundException("User not found");
		const rootRoadmap: RawRoadmap = await this.generateRoadmap(dto.title, dto.size);
		const roadmap: RoadmapNodeDocument = await this.saveRoadmap(rootRoadmap, dto.user_id, dto.size);
		await this.subscriptionsService.deductCredits(dto.user_id, GENERATE_ROADMAP_CREDIT_COST);
		await this.usersService.addRoadmapId(dto.user_id, roadmap._id);
	}

	public async generateRoadmap(title: string, size: RoadmapSize): Promise<RawRoadmap> {
		const template = getTemplate(size, title);
		const completion = await this.gemini.generateContent(template);
		const jsonData: string = completion.response.text();
		const parsedData: RawRoadmap = JSON.parse(jsonData) as RawRoadmap;
		return parsedData;
	}

	public async saveRoadmap(
		rawRoadmap: RawRoadmap,
		userId: string,
		size: RoadmapSize,
		parentId?: string
	): Promise<RoadmapNodeDocument> {
		const coveredMaterial: string[] = [];

		const saveNodeRecursively = async (
			rawNode: RawRoadmap,
			parentId?: string
		): Promise<RoadmapNodeDocument> => {
			const isRootNode = !parentId;
			const hasChildren = "children" in rawNode && rawNode.children.length > 0;
			const newNode = await this.model.create({
				title: rawNode.title,
				parent_node_id: parentId,
			});
			if (isRootNode) {
				newNode.owner_id = userId;
				newNode.size = size;
			}
			if (hasChildren) {
				// in this case, iterate over children
				for (const childNode of rawNode.children) {
					const childDocument = await saveNodeRecursively(childNode, newNode._id.toString());
					newNode.children.push(childDocument._id as unknown as RoadmapNodeDocument);
				}

				await newNode.save();
			} else {
				// no children, means this is lesson node
				coveredMaterial.push(rawNode.title);
				await this.createAndBindQuizAndLesson(newNode, coveredMaterial, userId);
			}

			return newNode;
		};

		return saveNodeRecursively(rawRoadmap, parentId);
	}

	async createAndBindQuizAndLesson(
		node: RoadmapNodeDocument,
		covered_material: string[],
		owner_id: string
	): Promise<void> {
		const quiz = await this.quizzesService.createQuiz({
			title: `Quiz: ${node.title}`,
			messages: [],
			covered_material,
			node_id: node._id.toString(),
			owner_id,
		});

		const lesson = await this.lessonsService.createLesson({
			title: node.title,
			messages: [],
			owner_id,
			node_id: node._id.toString(),
		});

		node.lesson_id = lesson._id.toString();
		node.quiz_id = quiz._id.toString();
		await node.save();
	}

	public async getRoadmapNodeById(id: string): Promise<RoadmapNodeDocument> {
		const roadmapNode = await this.model.findById(id);

		if (!roadmapNode) throw new NotFoundException("Roadmap node not found");

		return roadmapNode;
	}

	public async getRoadmapSubtreeById(_id: string): Promise<RoadmapNodeDocument> {
		// recursive population is enabled only on find method
		const [roadmap] = await this.model.find({ _id });
		if (!roadmap) throw new NotFoundException("Roadmap root not found");

		return roadmap;
	}

	public async toggleRoadmapNodeCompetencyById(id: string) {
		const roadmapNode = await this.getRoadmapNodeById(id);

		roadmapNode.is_completed = !roadmapNode.is_completed;

		return await roadmapNode.save();
	}

	public async deleteRoadmapSubtreeById(dto: DeleteRootRoadmapDto): Promise<User> {
		const { id, user_id } = dto;
		const result = await this.model.aggregate<RoadmapNode & { hierarchy: RoadmapNode[] }>([
			{ $match: { _id: new Types.ObjectId(id) } },
			{
				$graphLookup: {
					from: RoadmapNodesCollectionName,
					startWith: "$children",
					connectFromField: "children",
					connectToField: "_id",
					as: "hierarchy",
				},
			},
		]);

		if (result.length === 0) return;

		for (const child of result[0].hierarchy) {
			await this.model.deleteOne({ _id: child._id });
		}
		const user = await this.usersService.findById(user_id);
		user.roadmaps = user.roadmaps.filter((roadmap) => {
			if (!roadmap._id.toString().includes(id)) return roadmap;
		});

		await this.model.deleteOne(result[0]._id);
		return await user.save();
	}

	public async getAllUserRoadmaps(dto: { owner_id: string }) {
		const { owner_id } = dto;
		const user: UserDocument = await this.usersService.findById(owner_id);
		if (!user) throw new NotFoundException("User not found");
		const roadmaps: Types.ObjectId[] = user.roadmaps;
		return await this.model.find({ _id: { $in: roadmaps } });
	}

	public async generateSectionNode(dto: GenerateSectionNodeDto) {
		const { title, roadmap_id, owner_id, section_id } = dto;
		const [roadmap]: RoadmapNodeDocument[] = await this.model.find({ owner_id, _id: roadmap_id });
		if (!roadmap) {
			throw new NotFoundException("Roadmap not found");
		}
		const rawSectionNode = await this.gemini.generateContent(sectionPromptTemplate(title, roadmap));

		const sectionNode = JSON.parse(rawSectionNode.response.text()) as RawRoadmap;

		const sectionNodeDocument: RoadmapNodeDocument = await this.model.create({
			title: sectionNode.title,
			children: [],
			is_completed: false,
			owner_id,
			parent_node_id: roadmap_id,
		});

		const sectionToInsertAfter = roadmap.children.find((child) => {
			return child._id.toString() === section_id;
		});

		const quiz = await this.quizzesService.getQuizById(sectionToInsertAfter.children[0].quiz_id);
		const covered_material = quiz.covered_material;

		for await (const node of sectionNode.children) {
			const newNode = await this.model.create({
				...node,
				is_completed: false,
				owner_id,
				parent_node_id: sectionNodeDocument._id,
			});
			covered_material.push(newNode.title);
			sectionNodeDocument.children.push(newNode);

			await this.createAndBindQuizAndLesson(newNode, covered_material, owner_id);

			await newNode.save();
		}

		roadmap.children = [
			...roadmap.children.slice(0, roadmap.children.indexOf(sectionToInsertAfter) + 1),
			sectionNodeDocument,
			...roadmap.children.slice(roadmap.children.indexOf(sectionToInsertAfter) + 1),
		];

		await sectionNodeDocument.save();

		await roadmap.save();
	}
}
