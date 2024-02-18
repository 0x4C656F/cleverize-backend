import { Controller, Get, UseGuards } from "@nestjs/common";
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
	@UseGuards(AuthGuard("jwt"))
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

}
