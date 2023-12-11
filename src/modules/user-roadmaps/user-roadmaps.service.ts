/* eslint-disable unicorn/no-array-for-each */
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { ToggleNodeIsCompletedDto } from "./dtos/toggle-roadmap-iscompleted.dto";
import generateRoadmap from "./logic/generate-roadmap";
import generateSubRoadmap from "./logic/generate-subroadmap";
import getRoadmapSize from "./logic/verify-title";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import { Conversation, ConversationDocument } from "../conversations/schemas/conversation.schema";
import { User, UserDocument } from "../user/entity/user.schema";
@Injectable()
export class UserRoadmapsService {
	constructor(
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		@InjectModel(Conversation.name) private readonly chatModel: Model<ConversationDocument>
	) {}

	public async toggleRoadmapNodeIsCompleted(
		payload: JWTPayload,
		parameters: ToggleNodeIsCompletedDto
	) {
		const roadmap = await this.model.findOne({
			owner_id: payload.sub,
			_id: parameters.roadmapId,
		});

		if (!roadmap) {
			throw new Error("Roadmap not found");
		}

		// Use forEach to modify the roadmap object directly
		roadmap.sub_roadmap_list.forEach((subroadmap) => {
			if (subroadmap.title === parameters.title) {
				// Toggle isCompleted for the subroadmap
				subroadmap.isCompleted = !subroadmap.isCompleted;
			} else {
				// Iterate over node_list and toggle isCompleted for matching node
				subroadmap.node_list.forEach((node) => {
					if (node.title === parameters.title) {
						node.isCompleted = !node.isCompleted;
					}
				});
			}
		});

		return await roadmap.save();
	}

	public async generateUserRoadmap(payload: JWTPayload, body: CreateUserRoadmapDto) {
		const user = await this.userModel.findOne({ user_id: payload.sub });

		if (!user) {
			throw new Error("User not found");
		}

		try {
			const roadmapSize = await getRoadmapSize(body.title); //This func gets the complexity of roadmap(sm|md|lg)
			const rootRoadmap = await generateRoadmap(body.title, roadmapSize.size);

			if (roadmapSize.size === "sm") {
				const list = rootRoadmap.roadmap;
				const smallUserRoadmapNodeList = list.map((title) => {
					const newChat = new this.chatModel({
						owner_id: payload.sub,
						node_title: title,
						messages: [],
					});
					void newChat.save();
					const id = newChat._id as Types.ObjectId;
					return {
						title: title,
						isCompleted: false,
						conversation_id: id,
					};
				});
				const roadmap = new this.model({
					owner_id: payload.sub,
					title: body.title,
					sub_roadmap_list: {
						title: body.title,
						isCompleted: false,
						node_list: smallUserRoadmapNodeList,
					},
					isCompleted: false,
					created_at: new Date(),
				});

				await roadmap.save();

				user.roadmaps.push(roadmap._id as Types.ObjectId);
				await user.save();

				return roadmap;
			} else {
				const list = rootRoadmap.roadmap;
				const subRoadmapPromises = list.map(async (title) => {
					const roadmap = await generateSubRoadmap(title, rootRoadmap, roadmapSize.size);
					const node_list = roadmap.roadmap;
					const parsedRoadmap = node_list.map((title: string) => {
						const newChat = new this.chatModel({
							owner_id: payload.sub,
							node_title: title,
							messages: [],
						});
						void newChat.save();
						const id = newChat._id as Types.ObjectId;
						return {
							title: title,
							isCompleted: false,
							conversation_id: id,
						};
					});
					return {
						title: title,
						node_list: parsedRoadmap,
						isCompleted: false,
					};
				});

				const subroadmaps = await Promise.all(subRoadmapPromises);

				const roadmap = new this.model({
					owner_id: payload.sub,
					title: body.title,
					sub_roadmap_list: subroadmaps,
					isCompleted: false,
					created_at: new Date(),
				});

				await roadmap.save();

				user.roadmaps.push(roadmap._id as Types.ObjectId);
				await user.save();

				return roadmap;
			}
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}

	private async addRoadmapIdToUser(userId: string, newRoadmapId: Types.ObjectId): Promise<void> {
		const updateResult = await this.userModel.findOneAndUpdate(
			{ user_id: userId },
			{ $push: { roadmaps: newRoadmapId } },
			{ new: true }
		);

		if (!updateResult) {
			throw new Error("User not found or update failed");
		}
	}
}
