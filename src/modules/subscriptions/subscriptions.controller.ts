import {
	Controller,
	Post,
	BadRequestException,
	Get,
	UseGuards,
	Req,
	RawBodyRequest,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import { Request } from "express";
import { Stripe } from "stripe";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: "2023-10-16",
});

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { Subscription } from "./subscription";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
	constructor(private readonly service: SubscriptionsService) {}

	@UseGuards(AuthGuard("jwt"))
	@Get("/subscription-data")
	public async getSubscriptionData(@UserPayload() payload: JWTPayload): Promise<Subscription> {
		return await this.service.getSubscriptionData(payload.sub);
	}

	// @UseGuards(AuthGuard("jwt"))
	// @Get("/top-up/:id/:credits")
	// public async topUpCredits(
	// 	@Param("id") id: string,
	// 	@Param("credits") credits: number
	// ): Promise<any> {
	// 	return await this.service.topUpCredits(id, credits);
	// }

	@Post("/stripe-webhook")
	public async handleStripeWebhook(@Req() request: RawBodyRequest<Request>): Promise<any> {
		try {
			const hook = stripe.webhooks.constructEvent(
				request.rawBody,
				request.headers["stripe-signature"],
				process.env.STRIPE_WEBHOOK_SECRET
			);

			const userId = (hook.data.object as { userId?: string })?.userId;
			if (userId) {
				await this.service.topUpCredits(userId, 50);
			}

			return { received: true };
		} catch (error) {
			console.error(`⚠️ Webhook signature verification failed: ${error}`);
			throw new BadRequestException("Invalid webhook signature");
		}
	}
}
