import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import OpenAI from "openai";

import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
import {
	RoadmapSize,
	RoadmapNode,
	RoadmapNodeDocument,
	RoadmapNodesCollectionName,
} from "./schema/roadmap-nodes.schema";
import { RawRoadmap } from "./types/raw-roadmap";
import getConfig from "../../config/config";
import { Lesson, LessonDocument } from "../lessons/schema/lesson.schema";
import { Quiz, QuizDocument } from "../quizzes/schema/quiz.schema";
import mediumTemplate from "../roadmap-nodes/prompts/md-roadmap.prompt";
import smallTemplate from "../roadmap-nodes/prompts/sm-roadmap.prompt";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserDocument } from "../user/schema/user.schema";
@Injectable()
export class RoadmapNodesService {
	private openai = new OpenAI({ apiKey: getConfig().openai.dimaApiKey });
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		@InjectModel(RoadmapNode.name) private readonly model: Model<RoadmapNodeDocument>,
		@InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
		@InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
		private readonly subscriptionsService: SubscriptionsService
	) {}

	public async generateRootRoadmap(dto: GenerateRootRoadmapDto) {
		try {
			const { title, user_id, size } = dto;

			const user = await this.userModel.findOne({ user_id });

			if (!user) throw new NotFoundException("User not found");

			const rootRoadmap = await this.generateRoadmap(title, size);

			await this.saveRoadmap(rootRoadmap, user_id, size, (roadmap) => {
				user.roadmaps.push(roadmap._id);
				void user.save();
			});
			void this.subscriptionsService.deductCredits(user_id, GENERATE_ROADMAP_CREDIT_COST);
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}

	private async saveRoadmap(
		firstNode: RawRoadmap,
		userId: string,
		size: RoadmapSize,
		callback: (roadmap: RoadmapNode) => void
	): Promise<RoadmapNode> {
		const model = this.model;
		const lessonModel = this.lessonModel;
		const quizModel = this.quizModel;
		const childrenTitles: string[] = [];
		async function roadmapNodeSaver(
			node: RawRoadmap,
			isRoot: boolean,
			parent_node_id?: string
		): Promise<RoadmapNode> {
			const newNode = new model({
				title: node.title,
				is_completed: false,
				children: [],
				...(!isRoot && parent_node_id && { parent_node_id }),
				...(isRoot && { owner_id: userId, size }), // Conditionally add owner_id and size
			});
			const children =
				node.children?.length > 0
					? await Promise.all(
							node.children.map((childNode) =>
								roadmapNodeSaver(childNode, false, newNode._id as string)
							)
					  )
					: [];

			if (children.length > 0) {
				newNode.children = children;
				await newNode.save();
			} else {
				childrenTitles.push(node.title);
				const quiz = await new quizModel({
					title: `Quiz: ${node.title}`,
					messages: [],
					covered_material: childrenTitles,
					node_id: newNode._id as string,
				}).save();

				const lesson = await new lessonModel({
					title: node.title,
					messages: [],
					node_id: newNode._id as string,
				}).save();

				newNode.lesson_id = lesson._id as string;
				newNode.quiz_id = quiz._id as string;

				await newNode.save(); // Save lesson with node_id
			}

			return newNode;
		}
		const roadmap = await roadmapNodeSaver(firstNode, true);
		callback(roadmap);
		return roadmap;
	}

	public async getRoadmapNodeById(id: string) {
		const roadmapNode = await this.model.findById(id);

		if (!roadmapNode) throw new NotFoundException("Roadmap node not found");

		return roadmapNode;
	}

	public async getRoadmapSubtreeById(id: string) {
		// recursive population is enabled only on find method
		const result = await this.model.find({ _id: id });
		if (result.length === 0) throw new NotFoundException("Roadmap root not found");

		return result[0];
	}

	public async toggleRoadmapNodeCompetencyById(id: string) {
		const roadmapNode = await this.getRoadmapNodeById(id);

		roadmapNode.is_completed = !roadmapNode.is_completed;

		return await roadmapNode.save();
	}

	public async deleteRoadmapSubtreeById(id: string, user_id: string) {
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
		const user = await this.userModel.findOne({ user_id });
		user.roadmaps = user.roadmaps.filter((roadmap) => {
			if (!roadmap._id.toString().includes(id)) return roadmap;
		});
		await user.save();
		await this.model.deleteOne(result[0]._id);
	}

	public async getAllUserRoadmaps(owner_id: string) {
		return await this.model.find({ owner_id, size: { $exists: true } });
	}

	private async generateRoadmap(title: string, size: RoadmapSize) {
		let template: string;
		switch (size) {
			case "sm": {
				template = smallTemplate(title);
				break;
			}
			case "md": {
				template = mediumTemplate(title);
				break;
			}
		}
		const completion = await this.openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: template,
				},
			],
			model: "gpt-3.5-turbo-1106",
			response_format: { type: "json_object" },
			max_tokens: 1500,
		});
		return JSON.parse(completion.choices[0].message.content) as RawRoadmap;
	}
}
