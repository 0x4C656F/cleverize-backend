import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import Stripe from "stripe";

@Controller("payments")
export class PaymentsController {
	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Get("/pay")
	async pay() {
		const stripe = new Stripe(
			"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"
		);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
			mode: "subscription",
		});
	}
}
