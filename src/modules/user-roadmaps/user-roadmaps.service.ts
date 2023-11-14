import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import generateRoadmap from "../ailogic/roadmapGenerator/generate-roadmap";
import generateSubRoadmap from "../ailogic/subRoadmapGenerator/generate-subroadmap";
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
			const list = this.parseNodeList(data);

			const subRoadmapPromises = list.map(async (title) => {
				const roadmap = await generateSubRoadmap(title, data);
				const parsedRoadmap = this.parseNodeList(roadmap).map((title: string) => {
					return {
						title: title,
						isCompleted: false,
					};
				});

				return {
					title: title,
					node_list: parsedRoadmap,
					isCompleted: false,
				};
			});

			const subRoadmap = await Promise.all(subRoadmapPromises);

			const roadmap = new this.model({
				owner_id: payload.sub,
				title: body.title,
				node_list: subRoadmap,
				isCompleted: false,
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
	private parseNodeList(nodeList: string): string[] {
		return nodeList.split("\n").map((item) => {
			return item.replace(/^\d+\.\s*/, "").trim();
		});
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
