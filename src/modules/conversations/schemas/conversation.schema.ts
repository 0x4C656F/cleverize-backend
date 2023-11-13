import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type Message = {
	role: string;
	content: string;
};

@Schema()
export class Conversation {
	public _id: Types.ObjectId;

	@Prop({ type: Types.ObjectId, required: true })
	public owner_id: Types.ObjectId;

	@Prop({ type: Types.ObjectId })
	public node_id: Types.ObjectId;

	@Prop({ type: [{ type: Object }] })
	public messages: Message[];
}

export type ConversationDocument = Conversation & Document;

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
