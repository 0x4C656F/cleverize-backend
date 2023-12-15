import { Controller, Get, Param } from "@nestjs/common";

import { UserRoadmapNodesService } from "./user-roadmap-nodes.service";

@Controller()
export class UserRoadmapNodesController {
	constructor(private readonly service: UserRoadmapNodesService) {}

	@Get("/:id")
	public async getSubtree(@Param("id") id: string) {
		return await this.service.getRoadmapSubtreeById(id);
	}
}
