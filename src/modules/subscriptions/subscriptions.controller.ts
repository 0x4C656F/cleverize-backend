import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

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
	public async topUpCredits(@Param("id") id: string, @Param("credits") credits: number) {
		return await this.service.topUpCredits(id, credits);
	}
}
