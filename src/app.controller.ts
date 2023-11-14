import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AppService } from "./app.service";
import getConfig from "./config/config";
import { startConversation } from "./modules/ailogic/coversations/conversation";
import generateSubRoadmap from "./modules/ailogic/roadmaps/subRoadmapGenerator/generate-subroadmap";
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
		console.log("touched");
		return "OK";
	}

	@Post("/callchat")
	async chat(@Body() body: { title: string; roadmap: { title: string }[] }) {
		return await startConversation(body.title, body.roadmap);
	}
	@Post("/call")
	async call(@Body() body: { title: string; roadmap: { roadmap: string[] } }) {
		return await generateSubRoadmap(body.title, body.roadmap);
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return "ok";
	}
}
