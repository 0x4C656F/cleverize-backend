import { Controller, Get, UseGuards } from "@nestjs/common";
import Stripe from "stripe";

import getConfig, { Config } from "./config/config";
import { AuthGuard } from "./modules/auth/auth.guard";

@Controller()
export class AppController {
	private readonly envvars: Config;

	constructor() {
		this.envvars = getConfig();
	}
	@Get("/health")
	healthCheck() {
		console.log("touched");
		return "OK";
	}
	@UseGuards(AuthGuard)
	@Get("/pay")
	async pay() {
		const stripe = new Stripe(this.envvars.stripe);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
			mode: "subscription",
		});
	}

	@UseGuards(AuthGuard)
	@Get("/health/protected")
	protected() {
		return {
			message: "ok",
			statusCode: 200,
		};
	}
}
