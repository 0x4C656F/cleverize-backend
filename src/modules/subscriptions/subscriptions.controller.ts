import { Controller, Post, Get, UseGuards, Req, RawBodyRequest } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { Subscription } from "./subscription";
import { SubscriptionsService } from "./subscriptions.service";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
	constructor(private readonly service: SubscriptionsService) {}

	@UseGuards(AuthGuard)
	@Get("/subscription-data")
	public async getSubscriptionData(@UserPayload() payload: JWTPayload): Promise<Subscription> {
		return await this.service.getSubscriptionData(payload.sub);
	}

	@UseGuards(AuthGuard)
	@Get("/credits")
	public async getCredits(@UserPayload() payload: JWTPayload): Promise<number> {
		return await this.service.getCredits(payload.sub);
	}

	// @UseGuards(AuthGuard)
	// @Get("/top-up/:id/:credits")
	// public async topUpCredits(
	// 	@Param("id") id: string,
	// 	@Param("credits") credits: number
	// ): Promise<any> {
	// 	return await this.service.topUpCredits(id, credits);
	// }

	@Post("/stripe-webhook")
	public handleStripeWebhook(@Req() request: RawBodyRequest<Request>) {
		console.log("Received webhook");
		return this.service.handleWebhook(request);
	}
}
