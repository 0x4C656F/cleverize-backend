import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Feedback extends Document {
	@Prop({ required: true })
	user_id: string;

	@Prop()
	feedback: string;

	@Prop({ type: Number, min: 0, max: 5, required: true })
	rating: number;

	@Prop({ type: Types.ObjectId, ref: "Conversation" })
	lesson_id?: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Roadmap" })
	roadmap_id?: Types.ObjectId;
}

export type FeedbackDocument = Feedback & Document;

const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Custom validation for lesson_id and roadmap_id
FeedbackSchema.pre("save", function (next) {
	if (this.lesson_id && this.roadmap_id) {
		next(new Error("Only one of lesson_id or roadmap_id should be present."));
	} else if (!this.lesson_id && !this.roadmap_id) {
		next(new Error("Either lesson_id or roadmap_id must be provided."));
	} else {
		next();
	}
});

export { FeedbackSchema };
