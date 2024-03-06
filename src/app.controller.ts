import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
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

	@Get("cookie")
	cookie(@Res({ passthrough: true }) response: Response) {
		response.cookie("cookie", "cookie", {
			sameSite: true, // 'Strict', 'Lax', or 'None'
			httpOnly: false,
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 3,
		});
		return "cookie";
	}
}
