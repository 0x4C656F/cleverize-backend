import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import OpenAI from "openai";

import { DeleteRootRoadmapDto } from "./dto/delete-root-roadmap-dto";
import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
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
import mediumTemplate from "../roadmap-nodes/prompts/md-roadmap.prompt";
import smallTemplate from "../roadmap-nodes/prompts/sm-roadmap.prompt";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UserDocument } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";
@Injectable()
export class RoadmapNodesService {
	private openai = new OpenAI({ apiKey: getConfiguration().openai.dimaApiKey });
	constructor(
		@InjectModel(RoadmapNode.name) private readonly model: Model<RoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly usersService: UsersService,
		private readonly lessonsService: LessonsService,
		private readonly quizzesService: QuizzesService
	) {}

	public async generateRootRoadmap(dto: GenerateRootRoadmapDto): Promise<void> {
		const user: UserDocument = await this.model.findById(dto.user_id);

		if (!user) {
			throw new NotFoundException("User not found");
		}

		const rootRoadmap = await this.generateRoadmap(dto.title, dto.size);
		const roadmap: RoadmapNodeDocument = await this.saveRoadmap(rootRoadmap, dto.user_id, dto.size);
		user.roadmaps.push(roadmap._id);
		await user.save();
		await this.subscriptionsService.deductCredits(dto.user_id, GENERATE_ROADMAP_CREDIT_COST);
	}

	private async generateRoadmap(title: string, size: RoadmapSize): Promise<RawRoadmap> {
		const template = size === RoadmapSize.SMALL ? smallTemplate(title) : mediumTemplate(title);
		const completion = await this.openai.chat.completions.create({
			messages: [{ role: "system", content: template }],
			model: "gpt-3.5-turbo-1106",
			max_tokens: 1500,
		});

		return JSON.parse(completion.choices[0].message.content) as RawRoadmap;
	}

	public async saveRoadmap(
		firstNode: RawRoadmap,
		userId: string,
		size: RoadmapSize
	): Promise<RoadmapNodeDocument> {
		const coveredMaterial: string[] = [];

		const saveNodeRecursively = async (
			node: RawRoadmap,
			parentId?: string
		): Promise<RoadmapNodeDocument> => {
			const newNode = await this.model.create({
				title: node.title,
				is_completed: false,
				parent_node_id: parentId || undefined,
				...(parentId ? {} : { owner_id: userId, size }),
				children: [],
			});

			if (node.children && node.children.length > 0) {
				for (const childNode of node.children) {
					const childDocument = await saveNodeRecursively(childNode, newNode._id.toString());
					newNode.children.push(childDocument);
				}
				await newNode.save();
			} else {
				coveredMaterial.push(newNode.title);
				await this.createAndBindQuizAndLesson(newNode, coveredMaterial, userId);
			}

			return newNode;
		};

		return saveNodeRecursively(firstNode);
	}

	private async createAndBindQuizAndLesson(
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

	public async getRoadmapSubtreeById(id: string): Promise<RoadmapNodeDocument> {
		// recursive population is enabled only on find method
		const [roadmap] = await this.model.find({ _id: id });
		if (!roadmap) throw new NotFoundException("Roadmap root not found");

		return roadmap;
	}

	public async toggleRoadmapNodeCompetencyById(id: string) {
		const roadmapNode = await this.getRoadmapNodeById(id);

		roadmapNode.is_completed = !roadmapNode.is_completed;

		return await roadmapNode.save();
	}

	public async deleteRoadmapSubtreeById(dto: DeleteRootRoadmapDto) {
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
		await user.save();
		await this.model.deleteOne(result[0]._id);
	}

	public async getAllUserRoadmaps(dto: { owner_id: string }) {
		const { owner_id } = dto;
		const user: UserDocument = await this.usersService.findById(owner_id);
		if (!user) throw new NotFoundException("User not found");
		const roadmaps: Types.ObjectId[] = user.roadmaps;
		return await this.model.find({ _id: { $in: roadmaps } });
	}
}
