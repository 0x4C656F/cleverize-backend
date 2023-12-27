import {
	Controller,
	Post,
	BadRequestException,
	Get,
	Param,
	UseGuards,
	Req,
	RawBodyRequest,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import { Request } from "express";
import { Stripe } from "stripe";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET);

import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
	constructor(private readonly service: SubscriptionsService) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Get("activate-trial")
	public async activateTrial(@Param("id") id: string) {
		return await this.service.activateTrial(id);
	}

	@Get("/top-up/:id/:credits") // Prototype
	public async topUpCredits(
		@Param("id") id: string,
		@Param("credits") credits: number
	): Promise<any> {
		try {
			await this.service.topUpCredits(id, credits);
		} catch (error) {
			console.error(error);
			throw new Error("An error occurred while topping up credits.");
		}
	}

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
				await this.topUpCredits(userId, 50);
			}

			return { received: true };
		} catch (error) {
			console.error(`⚠️ Webhook signature verification failed: ${error}`);
			throw new BadRequestException("Invalid webhook signature");
		}
	}
}
