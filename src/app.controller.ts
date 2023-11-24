import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppService } from "./app.service";
import getConfig, { Config } from "./config/config";
import { startConversation } from "./modules/ailogic/coversations/conversation";
import generateSubRoadmap from "./modules/ailogic/roadmaps/subRoadmapGenerator/generate-subroadmap";
@Controller()
export class AppController {
	private readonly envvars: Config;

	constructor(private readonly appService: AppService) {
		this.envvars = getConfig();
	}
	@Get("/health")
	healthCheck() {
		console.log("touched");
		return "OK";
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return {
			message: "ok",
			statusCode: 200,
		};
	}
}
