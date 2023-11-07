import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AppService } from "./app.service";
import { generateRoadmap } from "./modules/ailogic/roadmapGenerator/generate_roadmap";
import { AuthGuard } from "@nestjs/passport";
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}
	@Get("/health")
	healthCheck() {
		return "OK";
	}
	@Post("/call")
	async call(@Body() body: { title: string }) {
		console.log(body);
		let res = await generateRoadmap(body.title);
	}
	@UseGuards(AuthGuard())
	@Get("/health/protected")
	protected() {
		return "AUTH OK";
	}
}
