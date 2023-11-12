import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import generateRoadmap from "../ailogic/roadmapGenerator/generate-roadmap";
import generateSubroadmap from "../ailogic/subRoadmapGenerator/generate-subroadmap";
import { User, UserDocument } from "../user/entity/user.schema";

@Injectable()
export class UserRoadmapsService {
	constructor(
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>
	) {}

	public async generateUserRoadmap(payload: JWTPayload, body: CreateUserRoadmapDto) {
		const user = await this.userModel.findOne({ user_id: payload.sub });

		if (!user) {
			throw new Error("User not found");
		}

		try {
			const data = await generateRoadmap(body.title);
			const list = data.match(/(?<=\d\. )\w+/gm);

			const nodeList = list.map((title) => ({
				title,
				sub_roadmap_id: undefined,
			}));

			const roadmap = new this.model({
				owner_id: payload.sub,
				title: body.title,
				node_list: nodeList,
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

	private async addRoadmapIdToUser(userId: string, newRoadmapId: Types.ObjectId): Promise<void> {
		const updateResult = await this.userModel.findOneAndUpdate(
			{ user_id: userId }, // filter by OAuth identifier instead of _id
			{ $push: { roadmaps: newRoadmapId } }, // push the new roadmap ID to the roadmaps array
			{ new: true } // option to return the modified document
		);

		if (!updateResult) {
			throw new Error("User not found or update failed");
		}
	}

	// Make sure to call this method after the roadmap is successfully created and saved.
}
