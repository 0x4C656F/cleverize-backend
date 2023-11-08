import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppService } from "./app.service";
import getConfig from "./config/config";
import { generateRoadmap } from "./modules/ailogic/roadmapGenerator/generate_roadmap";
@Controller()
export class AppController {
	private readonly envvars: {
		port: number;
		mongodbURI: string;
		auth0: {
			audience: string;
			domain: string;
			clientId: string;
			clientSecret: string;
		};
	};
	constructor(private readonly appService: AppService) {
		this.envvars = getConfig();
	}
	@Get("/health")
	healthCheck() {
		return "OK";
	}
	@Post("/call")
	async call(@Body() body: { title: string }) {
		return await generateRoadmap(body.title);
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return this.envvars;
	}
}
