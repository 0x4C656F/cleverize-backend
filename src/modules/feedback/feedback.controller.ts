import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Model, Types } from "mongoose";

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
		const { lesson_id, roadmap_id, rating, feedback } = createFeedbackBodyDto;
		const feedbackBody: {
			lesson_id?: Types.ObjectId;
			roadmap_id?: Types.ObjectId;
			rating: number;
			feedback: string;
			user_id: string;
		} = {
			rating,
			feedback: feedback,
			user_id: payload.sub,
		};
		if (lesson_id) {
			feedbackBody.lesson_id = new Types.ObjectId(lesson_id);
		} else {
			feedbackBody.roadmap_id = new Types.ObjectId(roadmap_id);
		}
		return await new this.model(feedbackBody).save();
	}
}
