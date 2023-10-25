import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { OperateUserRoadmapByIdDto } from "./dtos/operate-user-roadmap-by-id.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";

@ApiTags("User roadmaps")
@Controller()
export class UserRoadmapsController {
	constructor(@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>) {}

	@Post("/users/:userId/roadmaps")
	public async createUserRoadmap(@Body() dto: CreateUserRoadmapDto) {
		const roadmap = new this.model(dto);

		return await roadmap.save();
	}

	@Get("/users/:userId/roadmaps/:roadmapId")
	public async getUserRoadmapById(@Param() parameters: OperateUserRoadmapByIdDto) {
		const roadmap = await this.model
			.findOne({ id: parameters.roadmapId, user_id: parameters.userId })
			.exec();

		if (!roadmap) throw new NotFoundException();

		return roadmap;
	}
}
