import { Controller, Get } from "@nestjs/common";
import Stripe from "stripe";

@Controller("/payments")
export class PaymentsController {
	@Get("/pay")
	async pay() {
		const stripe = new Stripe(
			"sk_test_51OEFinCCMdYQSDIPUbKpBEyjIDRxKGh60ydtfsh5QD0g6XMZ9K1VDUEXhbUbWC9ptLBx7J4MtnBl240xDvR5LbVz00Acgca4Xu"
		);
		return await stripe.checkout.sessions.create({
			success_url: "https://www.cleverize.co/",
			line_items: [{ price: "price_1OGjr6CCMdYQSDIPdpIm2LSR", quantity: 1 }],
			mode: "subscription",
		});
	}
}
