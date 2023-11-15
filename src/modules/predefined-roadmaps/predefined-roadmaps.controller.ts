import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { CreatePredefinedRoadmapBodyDto } from "./dtos/create-predefined-roadmap.dto";
import { OperatePredefinedRoadmapByIdDto } from "./dtos/operate-predefined-roadmap-by-id.dto";
import { PredefinedRoadmapsService } from "./predefined-roadmaps.service";
import { PredefinedRoadmap, PredefinedRoadmapDocument } from "./schemas/predefined-roadmap.schema";

@ApiTags("Predefined roadmaps")
@Controller("/roadmaps")
export class PredefinedRoadmapsController {
	constructor(
		@InjectModel(PredefinedRoadmap.name) private readonly model: Model<PredefinedRoadmapDocument>,
		private readonly service: PredefinedRoadmapsService
	) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Post("/")
	public async createPredefinedRoadmap(
		@UserPayload() payload: JWTPayload,
		@Body() body: CreatePredefinedRoadmapBodyDto
	) {
		const roadmap = new this.model(Object.assign(body, { owner_id: payload.sub }));

		try {
			return await roadmap.save();
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Get("/")
	public async getAllPredefinedRoadmaps() {
		return await this.model.find();
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Delete("/:roadmapId")
	public async deletePredefinedRoadmapById(@Param() parameters: OperatePredefinedRoadmapByIdDto) {
		return await this.model.deleteOne({ _id: parameters.roadmapId });
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Post("/copy/:roadmapId")
	public async copyPredefinedRoadmapToUser(
		@UserPayload() payload: JWTPayload,
		@Param() parameters: OperatePredefinedRoadmapByIdDto
	) {
		return await this.service.copyPredefinedRoadmapToUser(
			Object.assign(parameters, { userId: payload.sub })
		);
	}
}
