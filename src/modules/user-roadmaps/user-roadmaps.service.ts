import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import { generateRoadmap } from "../ailogic/roadmapGenerator/generate_roadmap";

@Injectable()
export class UserRoadmapsService {
	constructor(@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>) {}

	public async generateUserRoadmap(payload: JWTPayload, body: CreateUserRoadmapDto) {
		try {
			const data = await generateRoadmap(body.title);
			const list = data.match(/(?<=\d\. )\w+/gm);

			const nodeList = list.map((title) => ({
				title,
				sub_roadmap_id: undefined,
			}));

			const roadmap = new this.model({
				user_id: payload.sub,
				title: body.title,
				node_list: nodeList,
			});

			return await roadmap.save();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
