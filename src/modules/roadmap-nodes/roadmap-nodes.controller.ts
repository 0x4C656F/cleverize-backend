import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { GenerateRootRoadmapBodyDto } from "./dto/generate-root-roadmap.dto";
import { RoadmapNodesService } from "./roadmap-nodes.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreditsGuard } from "../subscriptions/credits.guard";
import { GENERATE_ROADMAP_CREDIT_COST } from "../subscriptions/subscription";

@Controller("roadmaps")
export class RoadmapNodesController {
	constructor(private readonly service: RoadmapNodesService) {}

	@UseGuards(AuthGuard)
	@Get("subtree/:id")
	public async getSubtree(@Param("id") id: string) {
		return await this.service.getRoadmapSubtreeById(id);
	}

	@UseGuards(AuthGuard)
	@Get("node/:id")
	public async getNode(@Param("id") id: string) {
		return await this.service.getRoadmapNodeById(id);
	}

	@UseGuards(AuthGuard, CreditsGuard(GENERATE_ROADMAP_CREDIT_COST))
	@Post()
	public async generateRootRoadmap(
		@Body() dto: GenerateRootRoadmapBodyDto,
		@UserPayload() { sub: user_id }: JWTPayload
	) {
		return await this.service.generateRootRoadmap(Object.assign(dto, { user_id }));
	}

	@UseGuards(AuthGuard)
	@Get("/all")
	public async getAllUserRoadmaps(@UserPayload() { sub: owner_id }: JWTPayload) {
		return await this.service.getAllUserRoadmaps({ owner_id });
	}

	@UseGuards(AuthGuard)
	@Delete("/delete/:id")
	public async deleteNode(@Param("id") id: string, @UserPayload() { sub: user_id }: JWTPayload) {
		return await this.service.deleteRoadmapSubtreeById({ id, user_id });
	}
}
