/* eslint-disable unicorn/no-array-for-each */
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";

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
			// const roadmapSize = await getRoadmapSize(body.title); //This func gets the complexity of roadmap(sm|md|lg)
			const roadmapSize = "md";

			const rootRoadmap = await generateRoadmap(body.title, roadmapSize);

			const subRoadmapListPromises = rootRoadmap.children.map(async (subroadmap) => {
				const nodeList = await Promise.all(
					subroadmap.children.map(async (node) => {
						const newConversation = new this.chatModel({
							owner_id: payload.sub,
							node_title: node,
							messages: [],
						});
						await newConversation.save();
						return {
							title: node,
							isCompleted: false,
							conversation_id: newConversation._id as ObjectId,
						};
					})
				);

				return {
					title: subroadmap.title,
					isCompleted: false,
					node_list: nodeList,
				};
			});

			const subRoadmapList = await Promise.all(subRoadmapListPromises);
			const roadmap = new this.model({
				owner_id: payload.sub,
				title: rootRoadmap.title,
				sub_roadmap_list: subRoadmapList,
				isCompleted: false,
				size: "md",
				created_at: new Date(),
			});
			await roadmap.save();

			user.roadmaps.push(roadmap._id as Types.ObjectId);

			await user.save();

			return roadmap;
		} catch (error) {
			Logger.error(error);
			throw error;
		}
	}
}
