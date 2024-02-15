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
		const { conversation_id, roadmap_id, rating, feedback } = createFeedbackBodyDto;
		if ((conversation_id && roadmap_id) || (!conversation_id && !roadmap_id)) {
			throw new Error("Either conversation_id or roadmap_id must be provided, but not both.");
		}
		console.log(createFeedbackBodyDto);
		return await new this.model({
			conversation_id,
			roadmap_id,
			rating,
			feedback,
			user_id: payload.sub,
		}).save();
	}
}
