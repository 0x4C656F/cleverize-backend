/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Header, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Stripe } from "stripe";

import { StripeService } from "./stripe.service";

@Controller("payments")
export class PaymentsController {
	private stripe = new Stripe(
		"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"
	);
	constructor(private readonly stripeService: StripeService) {}
	@UseGuards(AuthGuard("jwt"))
	@Post("/pay")
	async pay() {
		return await this.stripe.checkout.sessions.create({
			line_items: [
				{
					price: "price_1OGjr6CCMdYQSDIPdpIm2LSR",
					quantity: 1,
				},
			],
			mode: "subscription",
			success_url: `https://localhost:3000/?success=true`,
			cancel_url: `https://localhost:3000/?canceled=true`,
		});
	}
}
