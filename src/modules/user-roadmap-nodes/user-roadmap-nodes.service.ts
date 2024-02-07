import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
import {
	UserRoadmapNode,
	UserRoadmapNodeDocument,
	UserRoadmapNodesCollectionName,
} from "./user-roadmap-nodes.schema";
import { Conversation, ConversationDocument } from "../conversations/schemas/conversation.schema";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserDocument } from "../user/entity/user.schema";
import generateRoadmap, { AiOutputRoadmap } from "../user-roadmaps/logic/generate-roadmap";
@Injectable()
export class UserRoadmapNodesService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		@InjectModel(UserRoadmapNode.name) private readonly model: Model<UserRoadmapNodeDocument>,
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		private readonly subscriptionsService: SubscriptionsService
	) {}

	public async generateRootRoadmap(dto: GenerateRootRoadmapDto) {
		try {
			const { title, user_id, size } = dto;

			const user = await this.userModel.findOne({ user_id });

			if (!user) throw new NotFoundException("User not found");

			const rootRoadmap = await generateRoadmap(title, size);

			const roadmap = await this.saveRoadmap(rootRoadmap, true, user_id);

			user.roadmaps.push(roadmap._id);

			await user.save();
			void (await this.subscriptionsService.deductCredits(user_id, GENERATE_ROADMAP_CREDIT_COST));
			return user;
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}

	private async saveRoadmap(
		firstNode: AiOutputRoadmap,
		isRoot: boolean,
		userId: string
	): Promise<UserRoadmapNode> {
		const model = this.model;
		const conversationModel = this.conversationModel;

		async function roadmapNodeSaver(
			node: AiOutputRoadmap,
			isRoot: boolean,
			userId: string
		): Promise<UserRoadmapNode> {
			if (node.children && node.children.length > 0) {
				const childrenPromises = node.children.map((childNode) => {
					return roadmapNodeSaver(childNode, false, userId);
				});

				const children = await Promise.all(childrenPromises);

				let roadmapNode: UserRoadmapNodeDocument;
				if (isRoot) {
					node = new model({
						title: node.title,
						children: children,
						is_completed: false,
						owner_id: userId,
					});
				} else {
					node = new model({
						title: node.title,
						children: children,
						is_completed: false,
					});
				}

				try {
					await roadmapNode.save();
				} catch (error) {
					Logger.error(error);
					throw error;
				}

				return roadmapNode;
			} else {
				const conversation = new conversationModel({
					node_title: node.title,
					messages: [],
					owner_id: userId,
				});

				const newNode = new model({
					conversation_id: conversation._id as string,
					title: node.title,
					is_completed: false,
					children: [],
				});

				try {
					await conversation.save();
					await newNode.save();
				} catch (error) {
					Logger.error(error);
					throw error;
				}

				return newNode;
			}
		}
		return await roadmapNodeSaver(firstNode, isRoot, userId);
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
		const result = await this.model.aggregate<UserRoadmapNode & { hierarchy: UserRoadmapNode[] }>([
			{ $match: { _id: new Types.ObjectId(id) } },
			{
				$graphLookup: {
					from: UserRoadmapNodesCollectionName,
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
		return await this.model.find({ owner_id });
	}
}
