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
import { Expense, ExpenseDocument } from "../expenses/expenses.shema";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserDocument } from "../user/entity/user.schema";
import generateRoadmap, { AiOutputRoadmap } from "../user-roadmaps/logic/generate-roadmap";

@Injectable()
export class UserRoadmapNodesService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		@InjectModel(UserRoadmapNode.name) private readonly model: Model<UserRoadmapNodeDocument>,
		@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		private readonly subscriptionsService: SubscriptionsService
	) {}

	public async generateRootRoadmap(dto: GenerateRootRoadmapDto) {
		const { title, user_id, size } = dto;

		const user = await this.userModel.findOne({ user_id });

		try {
			if (!user) throw new NotFoundException("User not found");

			const rootRoadmap = await generateRoadmap(title, size, async (expense: Expense) => {
				await new this.expenseModel(expense).save();
			});
			// const mock = roadmap;
			const id = await this.roadmapNodeSaver(rootRoadmap, true, user_id);

			user.roadmaps.push(id);

			await user.save();
			void this.subscriptionsService.deductCredits(user_id, GENERATE_ROADMAP_CREDIT_COST);
			return user;
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}

	private async roadmapNodeSaver(
		node: AiOutputRoadmap,
		isRoot: boolean,
		user_id: string
	): Promise<Types.ObjectId> {
		try {
			if (node.children && node.children.length > 0) {
				const childrenPromises = node.children.map(async (childNode) => {
					return await this.roadmapNodeSaver(childNode, false, user_id);
				});

				const children = await Promise.all(childrenPromises);

				const newNode = isRoot
					? new this.model({
							title: node.title,
							children: children,
							is_completed: false,
							owner_id: user_id,
					  })
					: new this.model({
							title: node.title,
							children: children,
							is_completed: false,
					  });
				await newNode.save();

				return newNode._id as Types.ObjectId;
			} else {
				const conversation = new this.conversationModel({
					node_title: node.title,
					messages: [],
					owner_id: user_id,
				});

				const newNode = new this.model({
					conversation_id: conversation._id as string,
					title: node.title,
					is_completed: false,
					children: [],
				});

				await conversation.save();

				await newNode.save();

				return newNode._id as Types.ObjectId;
			}
		} catch (error) {
			Logger.error(error);
			throw error;
		}
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
