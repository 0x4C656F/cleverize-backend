import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import Stripe from "stripe";

import { JWTPayload, UserPayload } from "./common/user-payload.decorator";
import getConfig, { Config } from "./config/configuration";
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
	@Post("/pay")
	async pay(@UserPayload() { sub }: JWTPayload) {
		const stripe = new Stripe(this.envvars.stripe);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			mode: "payment",
			metadata: {
				userId: sub,
			},
			line_items: [{ price: "price_1OzehcCCMdYQSDIPGnGJBXsp", quantity: 1 }],
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
