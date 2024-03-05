import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { CreateFeedbackBodyDto } from "./dto/create-feedback-body.dto";
import { Feedback, FeedbackDocument } from "./schema/feedback.schema";

@Injectable()
export class FeedbackService {
	constructor(@InjectModel(Feedback.name) private model: Model<FeedbackDocument>) {}

	async createFeedback(createFeedbackBodyDto: CreateFeedbackBodyDto, payload: JWTPayload) {
		const { lesson_id, roadmap_id, rating, feedback } = createFeedbackBodyDto;
		const feedbackBody = {
			rating,
			feedback,
			user_id: payload.sub,
			...(lesson_id ? { lesson_id } : { roadmap_id }),
		};
		return new this.model(feedbackBody).save();
	}
}
