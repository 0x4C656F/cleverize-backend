import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import Stripe from "stripe";

import getConfig from "../../config/config";
@Controller("payments")
export class PaymentsController {
	private config = getConfig();

	@Get("/pay")
	async pay() {
		const stripe = new Stripe(this.config.stripe);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
			mode: "subscription",
		});
	}
}
