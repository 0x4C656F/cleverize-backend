import { BadRequestException, Injectable, NotFoundException, RawBodyRequest } from "@nestjs/common";
import { config } from "dotenv";
import { Request } from "express";
import Stripe from "stripe";

import getConfiguration, { Config } from "src/config/configuration";

import { Subscription } from "./subscription";
import { UsersService } from "../users/users.service";

config();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: "2023-10-16",
});
const CREDITS_COEFFICIENT = 10;
@Injectable()
export class SubscriptionsService {
	config: Config;
	constructor(private userService: UsersService) {
		this.config = getConfiguration();
	}

	public async handleWebhook(request: RawBodyRequest<Request>) {
		try {
			const hook = stripe.webhooks.constructEvent(
				request.rawBody,
				request.headers["stripe-signature"],
				this.config.stripeWebhook
			);
			const { amount: amountInCents, customer } = hook.data.object as {
				amount: number;
				customer: string;
			};
			const amountInDollars = amountInCents / 100;

			const credits = amountInDollars * CREDITS_COEFFICIENT;

			const user = await this.userService.findByCustomerId(customer);

			user.subscription.credits += credits;
			user.subscription.last_credits_update = new Date();
			user.markModified("subscription");
			await user.save();
		} catch (error) {
			console.error(`⚠️ Webhook signature verification failed: ${error}`);
			throw new BadRequestException("Invalid webhook signature");
		}
	}

	public async getSubscriptionData(id: string): Promise<Subscription> {
		const user = await this.userService.findById(id);
		return user.subscription;
	}

	public async getCredits(id: string): Promise<number> {
		const user = await this.userService.findById(id);
		return user.subscription.credits;
	}

	public async topUpCredits(id: string, credits: number) {
		const user = await this.userService.findById(id);

		user.subscription.credits += Number(credits);
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}

	public async deductCredits(id: string, credits: number) {
		const user = await this.userService.findById(id);
		if (!user) throw new NotFoundException();

		user.subscription.credits -= credits;
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}
}
