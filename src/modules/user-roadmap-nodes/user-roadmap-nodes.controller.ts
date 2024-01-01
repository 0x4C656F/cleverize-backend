import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { GenerateRootRoadmapBodyDto } from "./dto/generate-root-roadmap.dto";
import { UserRoadmapNodesService } from "./user-roadmap-nodes.service";
import { CreditsGuard } from "../subscriptions/credits.guard";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";

@Controller("/roadmaps")
export class UserRoadmapNodesController {
	constructor(private readonly service: UserRoadmapNodesService) {}

	// @UseGuards(AuthGuard("jwt"))
	@Get("subtree/:id")
	public async getSubtree(@Param("id") id: string) {
		return await this.service.getRoadmapSubtreeById(id);
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("node/:id")
	public async getNode(@Param("id") id: string) {
		return await this.service.getRoadmapNodeById(id);
	}

	@UseGuards(AuthGuard("jwt"), CreditsGuard(GENERATE_ROADMAP_CREDIT_COST))
	@Post("/")
	public async generateRootRoadmap(
		@Body() body: GenerateRootRoadmapBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		return await this.service.generateRootRoadmap({
			title: body.title,
			user_id: payload.sub,
			size: body.size,
		});
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/all")
	public async getAllUserRoadmaps(@UserPayload() payload: JWTPayload) {
		return await this.service.getAllUserRoadmaps(payload.sub);
	}

	@UseGuards(AuthGuard("jwt"))
	@Delete("/delete/:id")
	public async deleteNode(@Param("id") id: string, @UserPayload() payload: JWTPayload) {
		return await this.service.deleteRoadmapSubtreeById(id, payload.sub);
	}
}
