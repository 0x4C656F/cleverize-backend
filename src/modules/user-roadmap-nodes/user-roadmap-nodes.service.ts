import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
import {
	RoadmapSize,
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

			const roadmap = await this.saveRoadmap(rootRoadmap, user_id, size);

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
		userId: string,
		size: RoadmapSize
	): Promise<UserRoadmapNode> {
		const model = this.model;
		const conversationModel = this.conversationModel;

		async function roadmapNodeSaver(
			node: AiOutputRoadmap,
			isRoot: boolean
		): Promise<UserRoadmapNode> {
			// Process children nodes recursively
			const children =
				node.children?.length > 0
					? await Promise.all(node.children.map((childNode) => roadmapNodeSaver(childNode, false)))
					: [];

			// Common node creation logic
			let newNode: UserRoadmapNodeDocument;
			if (isRoot || children.length > 0) {
				newNode = new model({
					title: node.title,
					children: children,
					is_completed: false,
					...(isRoot && { owner_id: userId, size }), // Conditionally add owner_id
				});
			} else {
				// If no children and not root, handle conversation node
				const conversation = new conversationModel({
					node_title: node.title,
					messages: [],
					owner_id: userId,
					node_id: "_",
				});
				await conversation.save(); // Save conversation first to use its ID
				newNode = new model({
					conversation_id: conversation._id as string,
					title: node.title,
					is_completed: false,
					children: [], // Explicitly set empty children for clarity
				});
				conversation.node_id = newNode._id as string; // Set conversation node_id
				await conversation.save(); // Save conversation with node_id
			}

			try {
				await newNode.save(); // Save the new or updated node
			} catch (error) {
				Logger.error(error);
				throw error; // Consider centralized error handling outside this function
			}

			return newNode;
		}

		return await roadmapNodeSaver(firstNode, true);
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
		return await this.model.find({ owner_id, size: { $exists: true } });
	}
}
