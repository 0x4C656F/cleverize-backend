import {
	Controller,
	Post,
	BadRequestException,
	Body,
	Headers,
	Get,
	Param,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Stripe } from "stripe";
const stripeKey = getConfig().stripe;
const stripe = new Stripe(stripeKey);

import getConfig from "src/config/config";

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
	public async handleStripeWebhook(
		@Body() payload: any,
		@Headers("stripe-signature") sig: string
	): Promise<any> {
		try {
			const hook = stripe.webhooks.constructEvent(
				payload as string,
				sig as string | Buffer,
				getConfig().stripe
			);

			const userId = (hook.data.object as { userId?: string })?.userId;
			await this.topUpCredits(userId, 50);
		} catch {
			console.error(
				`⚠️  Webhook signature verification failed. Check the logs to see the error from Stripe.`
			);
			throw new BadRequestException("Invalid webhook signature");
		}
	}
}
