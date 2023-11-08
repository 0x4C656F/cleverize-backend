import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AppService } from "./app.service";
import { generateRoadmap } from "./modules/ailogic/roadmapGenerator/generate_roadmap";
import { AuthGuard } from "@nestjs/passport";
import getConfig from "./config/config";
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
		let res = await generateRoadmap(body.title);
		return res;
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return this.envvars;
	}
}
