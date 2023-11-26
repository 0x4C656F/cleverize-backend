import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import Stripe from "stripe";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

@Controller("payments")
export class PaymentsController {
	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Get("/pay")
	async pay(@UserPayload() payload: JWTPayload) {
		const stripe = new Stripe(
			"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"
		);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_H5ggYwtDq4fbrJ", quantity: 1 }],
			mode: "subscription",
		});
	}
}
