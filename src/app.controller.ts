import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppService } from "./app.service";
import getConfig from "./config/config";
import { startConversation } from "./modules/ailogic/coversations/conversation";
import generateRoadmap from "./modules/ailogic/roadmapGenerator/generate-roadmap";
import generateSubroadmap from "./modules/ailogic/subRoadmapGenerator/generate-subroadmap";
import generateSubRoadmap from "./modules/ailogic/subRoadmapGenerator/generate-subroadmap";
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

	@Post("/callchat")
	async chat(@Body() body: { title: string; roadmap: string[] }) {
		return await startConversation(body.title, body.roadmap);
	}
	@Post("/call")
	async call(@Body() body: { title: string; roadmap: { roadmap: string[] } }) {
		return await generateSubRoadmap(body.title, body.roadmap);
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return this.envvars;
	}
}
