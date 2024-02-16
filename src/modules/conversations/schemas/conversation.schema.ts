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
	public owner_id: string;

	@Prop({required: true})
	public node_title: string;

	@Prop()
	public test_id?: string;

	@Prop({ type: Types.ObjectId })
	public node_id: string;

	@Prop({ type: [{ type: Object }] })
	public messages: Message[];
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
