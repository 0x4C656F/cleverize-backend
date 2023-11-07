import { Body, Controller, Get, Post } from "@nestjs/common";

import { AppService } from "./app.service";
import { generateRoadmap } from "./modules/ailogic/roadmapGenerator/generate_roadmap";
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
}
