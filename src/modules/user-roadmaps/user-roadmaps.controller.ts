import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { OperateUserRoadmapByIdDto } from "./dtos/operate-user-roadmap-by-id.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import { generateRoadmap } from "../ailogic/roadmapGenerator/generate_roadmap";

@ApiTags("User roadmaps")
@Controller()
export class UserRoadmapsController {
	constructor(@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>) {}

	@UseGuards(AuthGuard("jwt"))
	@Post("/users/me/roadmaps")
	public async createUserRoadmap(
		@UserPayload() payload: JWTPayload,
		@Body() body: CreateUserRoadmapDto
	) {
		try {
			const data = await generateRoadmap(body.title);
			const list = [...data.matchAll(/^\d+.\s*(.+)/gm)].map((match) => match[1]);

			const nodeList = list.map((title) => ({
				title,
				sub_roadmap_id: undefined,
			}));

			const roadmap = new this.model({
				owner_id: payload.sub,
				title: body.title,
				node_list: nodeList,
			});

			return await roadmap.save();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/users/me/roadmaps")
	public async getAllUserRoadmaps(@UserPayload() payload: JWTPayload) {
		return await this.model.find({ owner_id: payload.sub });
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/users/me/roadmaps/:roadmapId")
	public async getUserRoadmapById(
		@Param() parameters: OperateUserRoadmapByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		const roadmap = await this.model
			.findOne({ _id: parameters.roadmapId, owner_id: payload.sub })
			.exec();

		if (!roadmap) throw new NotFoundException();

		return roadmap;
	}

	@UseGuards(AuthGuard("jwt"))
	@Put("/users/me/roadmaps/:roadmapId")
	public async updateUserRoadmapById(
		@Param() parameters: OperateUserRoadmapByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		try {
			return await this.model
				.findOneAndUpdate(
					{ _id: parameters.roadmapId, owner_id: payload.sub },
					{ owner_id: "ff425bb266d02a7d43105376" }
				)
				.exec();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}

	@UseGuards(AuthGuard("jwt"))
	@Delete("/users/me/roadmaps/:roadmapId")
	public async deleteUserRoadmapById(
		@Param() parameters: OperateUserRoadmapByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		try {
			return await this.model.deleteOne({
				_id: parameters.roadmapId,
				owner_id: payload.sub,
			});
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
