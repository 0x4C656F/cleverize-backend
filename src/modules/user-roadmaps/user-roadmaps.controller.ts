import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { CreateUserRoadmapDto } from "./dtos/create-user-roadmap.dto";
import { OperateUserRoadmapByIdDto } from "./dtos/operate-user-roadmap-by-id.dto";
import { ToggleNodeIsCompletedDto } from "./dtos/toggle-roadmap-iscompleted.dto";
import { UserRoadmap, UserRoadmapDocument } from "./user-roadmaps.schema";
import { UserRoadmapsService } from "./user-roadmaps.service";

@ApiTags("User roadmaps")
@Controller()
export class UserRoadmapsController {
	constructor(
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		private readonly service: UserRoadmapsService
	) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Post("/users/me/roadmaps")
	public async createUserRoadmap(
		@UserPayload() payload: JWTPayload,
		@Body() body: CreateUserRoadmapDto
	) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return await this.service.generateUserRoadmap(payload, body);
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
	@Get("/users/me/roadmaps/:roadmapId/:title/complete")
	public async toggleRoadmapNodeIscompleted(
		@UserPayload() payload: JWTPayload,
		@Param() parameters: ToggleNodeIsCompletedDto
	) {
		return await this.service.toggleRoadmapNodeIscompleted(payload, parameters);
	}
	@UseGuards(AuthGuard("jwt"))
	@Put("/users/me/roadmaps/:roadmapId")
	public async updateUserRoadmapById(
		@Param() parameters: OperateUserRoadmapByIdDto,
		@UserPayload() payload: JWTPayload,
		@Body() body: UserRoadmap
	) {
		try {
			return await this.model
				.findOneAndUpdate({ _id: parameters.roadmapId, owner_id: payload.sub }, body)
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
