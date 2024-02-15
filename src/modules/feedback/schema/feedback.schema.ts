import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Feedback extends Document {
	@Prop({ type: Types.ObjectId, required: true })
	user_id: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: "Conversation" })
	conversation_id?: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Roadmap' })
	roadmap_id?: Types.ObjectId;

	@Prop()
	feedback: string;

	@Prop({ type: Number, min: 0, max: 5, required: true })
	rating: number;
}

export type FeedbackDocument = Feedback & Document;

const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Custom validation for conversation_id and roadmap_id
FeedbackSchema.pre("save", function (next) {
	if (this.conversation_id && this.roadmap_id) {
		next(new Error("Only one of conversation_id or roadmap_id should be present."));
	} else if (!this.conversation_id && !this.roadmap_id) {
		next(new Error("Either conversation_id or roadmap_id must be provided."));
	} else {
		next();
	}
});

export { FeedbackSchema };
