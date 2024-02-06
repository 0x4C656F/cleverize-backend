import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Model } from "mongoose";

import { UserPayload, JWTPayload } from "src/common/user-payload.decorator";

import { SaveTemplateObjectDto } from "./dtos/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import { RoadmapTemplatesService } from "./roadmap-templates.service";

@Controller("templates")
export class RoadmapTemplatesController {
	constructor(
		@InjectModel(TemplateRoadmapNode.name)
		private readonly model: Model<TemplateRoadmapNodeDocument>,
		private readonly service: RoadmapTemplatesService
	) {}

	@Get("/all")
	public async getAllTemplateRootNodes() {
		// if node has size value - is root
		return await this.model.find({ size: { $exists: true } });
	}

	@Get("/:id")
	public async getTemplateFullTree(@Param("id") id: string) {
		// on findOne request - auto children population, see schema
		const template = await this.model.findOne({ _id: id });

		if (!template) throw new NotFoundException();

		return template;
	}

	@Post("/")
	public async createTemplateRoadmap(@Body() dto: SaveTemplateObjectDto) {
		return await this.service.saveTemplateObject(dto);
	}

	@UseGuards(AuthGuard("jwt"))
	@Post("/copy/:id")
	public async copyTemplateToUserRoadmap(
		@Param("id") id: string,
		@UserPayload() payload: JWTPayload
	) {
		return await this.service.copyTemplateToUserRoadmap(id, payload.sub);
	}
}
