import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { CreateFeedbackBodyDto } from "./dto/create-feedback-body.dto";
import { Feedback, FeedbackDocument } from "./schema/feedback.schema";

@Controller("feedback")
export class FeedbackController {
	constructor(@InjectModel(Feedback.name) private model: Model<FeedbackDocument>) {}

	@Post()
	@UseGuards(AuthGuard("jwt"))
	async createFeedback(
		@Body() createFeedbackBodyDto: CreateFeedbackBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		console.log(createFeedbackBodyDto)
		return await new this.model({
			...createFeedbackBodyDto,
			user_id: payload.sub,
		}).save();
	}
}
