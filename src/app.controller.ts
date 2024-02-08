import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import Stripe from "stripe";

import { AppService } from "./app.service";
import getConfig, { Config } from "./config/config";
import generateRoadmap from "./modules/user-roadmaps/logic/generate-roadmap";

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

	@Get("/pay")
	async pay() {
		const stripe = new Stripe(this.envvars.stripe);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
			mode: "subscription",
		});
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return {
			message: "ok",
			statusCode: 200,
		};
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/call")
	async call() {
		return await generateRoadmap("java", "md");
	}
}
