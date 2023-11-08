import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import user_roadmap from "src/common/entities/user-roadmap";

import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import { User, UserDocument } from "../user/entity/user.schema";

@Injectable()
export class UserRoadmapsService {
	constructor(
		@InjectModel(UserRoadmap.name) private readonly user_roadmaps_model: Model<UserRoadmapDocument>,
		@InjectModel(User.name) private readonly user_model: Model<UserDocument>
	) {}

	async createUserRoadmap(newRoadmap: user_roadmap) {
		// const { title, owner_id } = newRoadmap;
		const roadmap = new this.user_roadmaps_model(newRoadmap);
		console.log(roadmap);
		return await roadmap.save();
	}
}
