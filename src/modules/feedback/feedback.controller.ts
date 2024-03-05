import { Controller, Post, Body, UseGuards } from "@nestjs/common";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { CreateFeedbackBodyDto } from "./dto/create-feedback-body.dto";
import { FeedbackService } from "./feedback.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("feedback")
export class FeedbackController {
	constructor(private service: FeedbackService) {}

	@Post()
	@UseGuards(AuthGuard)
	async createFeedback(
		@Body() createFeedbackBodyDto: CreateFeedbackBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		return await this.service.createFeedback(createFeedbackBodyDto, payload);
	}
}
