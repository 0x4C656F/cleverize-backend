import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
	private stripe: Stripe;

	constructor() {
		this.stripe = new Stripe(
			"sk_test_51OEFinCCMdYQSDIPUbKpBEyjIDRxKGh60ydtfsh5QD0g6XMZ9K1VDUEXhbUbWC9ptLBx7J4MtnBl240xDvR5LbVz00Acgca4Xu",
			{
				apiVersion: "2023-10-16",
			}
		);
	}

	async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
		return this.stripe.paymentIntents.create({
			amount,
			currency: "usd",
			// additional configuration
		});
	}
}
