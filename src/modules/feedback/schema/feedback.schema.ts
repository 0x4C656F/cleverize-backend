import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true }) 
export class Feedback extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Roadmap' })
  roadmap_id: Types.ObjectId;

  @Prop()
  feedback: string;

  @Prop({ type: Number, min: 0, max: 5, required: true }) // Limit numbers to be between 0 and 5
  rating: number;
}

export type FeedbackDocument = Feedback & Document;
export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

