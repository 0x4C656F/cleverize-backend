import {
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";

import { CreateUserRoadmapParametersDto } from "./dtos/create-user-roadmap.dto";
import { OperateUserRoadmapByIdDto } from "./dtos/operate-user-roadmap-by-id.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";

@ApiTags("User roadmaps")
@Controller()
export class UserRoadmapsController {
	constructor(@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>) {}

	@Post("/users/:ownerId/roadmaps")
	public async createUserRoadmap(@Param() parameters: CreateUserRoadmapParametersDto) {
		try {
			const roadmap = new this.model({ owner_id: parameters.ownerId });

			return await roadmap.save();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}

	@Get("/users/:ownerId/roadmaps/:roadmapId")
	public async getUserRoadmapById(@Param() parameters: OperateUserRoadmapByIdDto) {
		const roadmap = await this.model
			.findOne({ _id: parameters.roadmapId, owner_id: parameters.ownerId })
			.exec();

		if (!roadmap) throw new NotFoundException();

		return roadmap;
	}

	@Put("/users/:ownerId/roadmaps/:roadmapId")
	public async updateUserRoadmapById(@Param() parameters: OperateUserRoadmapByIdDto) {
		try {
			return await this.model
				.findOneAndUpdate(
					{ _id: parameters.roadmapId, owner_id: parameters.ownerId },
					{ owner_id: "ff425bb266d02a7d43105376" }
				)
				.exec();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}

	@Delete("/users/:ownerId/roadmaps/:roadmapId")
	public async deleteUserRoadmapById(@Param() parameters: OperateUserRoadmapByIdDto) {
		try {
			return await this.model.deleteOne({
				_id: parameters.roadmapId,
				owner_id: parameters.ownerId,
			});
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
