import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Response } from "express";
import { Model } from "mongoose";
import Stripe from "stripe";

import { JWTPayload, UserPayload } from "./common/user-payload.decorator";
import getConfiguration, { Config } from "./config/configuration";
import { AuthGuard } from "./modules/auth/auth.guard";
import mediumTemplate from "./modules/roadmap-nodes/prompts/md-roadmap.prompt";
import { User, UserDocument } from "./modules/users/schema/user.schema";

@Controller()
export class AppController {
	private readonly envvars: Config;
	gga = new GoogleGenerativeAI(getConfiguration().geminiApiKey);
	gemini: GenerativeModel;
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
		this.envvars = getConfiguration();
		this.gemini = this.gga.getGenerativeModel({ model: "gemini-1.5-pro" });
	}
	@Get("/health")
	healthCheck() {
		console.log("touched");
		return "OK";
	}
	@UseGuards(AuthGuard)
	@Post("/pay")
	async pay(@UserPayload() { sub }: JWTPayload) {
		const user = await this.userModel.findById(sub);

		const stripe = new Stripe(this.envvars.stripe);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			mode: "payment",
			customer: user.subscription.stripe_customer_id,
			line_items: [{ price: this.envvars.stripePrice, quantity: 1 }],
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
