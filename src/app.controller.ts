import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import Stripe from "stripe";

import { AppService } from "./app.service";
import getConfig, { Config } from "./config/config";

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
		const stripe = new Stripe(
			"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"
		);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGmHjCCMdYQSDIP4kMU1ovr", quantity: 1 }],
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
}
