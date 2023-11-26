import { Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Stripe } from "stripe";

@Controller("payments")
export class PaymentsController {
	private stripe = new Stripe(
		"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"
	);
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
