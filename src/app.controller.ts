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
	// @Get("/pay")
	// async pay() {
	// 	const stripe = new Stripe(
	// 		"sk_test_51OEFinCCMdYQSDIPUbKpBEyjIDRxKGh60ydtfsh5QD0g6XMZ9K1VDUEXhbUbWC9ptLBx7J4MtnBl240xDvR5LbVz00Acgca4Xu"
	// 	);
	// 	return await stripe.checkout.sessions.create({
	// 		success_url: "https://www.cleverize.co/",
	// 		line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
	// 		mode: "subscription",
	// 	});
	// }
	@UseGuards(AuthGuard("jwt"))
	@Get("/health/protected")
	protected() {
		return {
			message: "ok",
			statusCode: 200,
		};
	}
}
