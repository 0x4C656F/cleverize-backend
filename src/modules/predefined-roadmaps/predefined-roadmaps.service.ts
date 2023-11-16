import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from "src/modules/user/entity/user.schema";
import { UserRoadmap, UserRoadmapDocument } from "src/modules/user-roadmaps/user-roadmaps.schema";

import { PredefinedRoadmap, PredefinedRoadmapDocument } from "./schemas/predefined-roadmap.schema";

@Injectable()
export class PredefinedRoadmapsService {
	constructor(
		@InjectModel(PredefinedRoadmap.name) private readonly model: Model<PredefinedRoadmapDocument>,
		@InjectModel(UserRoadmap.name) private readonly userRoadmapModel: Model<UserRoadmapDocument>,
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>
	) {}

	public async copyPredefinedRoadmapToUser(dto: { roadmapId: string; userId: string }) {
		const roadmap = await this.model.findById(dto.roadmapId);

		if (!roadmap) throw new NotFoundException("Predefined roadmap not found");

		const roadmapObject = roadmap.toObject();

		const userRoadmapDto = Object.assign(roadmapObject, {
			isCompleted: false,
			node_list: roadmapObject.sub_roadmaps_list,
			_id: undefined,
		});

		const userRoadmap = new this.userRoadmapModel(userRoadmapDto);

		await userRoadmap.save();

		const updateResult = await this.userModel.findOneAndUpdate(
			{ user_id: dto.userId },
			{ $push: { roadmaps: userRoadmap } },
			{ new: true }
		);

		if (!updateResult) {
			throw new Error("User not found or update failed");
		}
	}
}
