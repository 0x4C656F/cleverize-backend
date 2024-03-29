import {
	Controller,
	Post,
	BadRequestException,
	Get,
	UseGuards,
	Req,
	RawBodyRequest,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import { Request } from "express";
import { Stripe } from "stripe";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: "2023-10-16",
});

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";
import getConfiguration, { Config } from "src/config/configuration";

import { Subscription } from "./subscription";
import { SubscriptionsService } from "./subscriptions.service";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
	config: Config;
	constructor(private readonly service: SubscriptionsService) {
		this.config = getConfiguration();
	}

	@UseGuards(AuthGuard)
	@Get("/subscription-data")
	public async getSubscriptionData(@UserPayload() payload: JWTPayload): Promise<Subscription> {
		return await this.service.getSubscriptionData(payload.sub);
	}

	// @UseGuards(AuthGuard)
	// @Get("/top-up/:id/:credits")
	// public async topUpCredits(
	// 	@Param("id") id: string,
	// 	@Param("credits") credits: number
	// ): Promise<any> {
	// 	return await this.service.topUpCredits(id, credits);
	// }

	@Post("/stripe-webhook")
	public handleStripeWebhook(@Req() request: RawBodyRequest<Request>) {
		console.log("Received webhook");
		try {
			const hook = stripe.webhooks.constructEvent(
				request.rawBody,
				request.headers["stripe-signature"],
				this.config.stripeWebhook
			);
			console.log(hook);
			const { amount } = hook.data.object as { amount: number };
			return { received: true };
		} catch (error) {
			console.error(`⚠️ Webhook signature verification failed: ${error}`);
			throw new BadRequestException("Invalid webhook signature");
		}
	}
}
