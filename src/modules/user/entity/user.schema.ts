import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class User {
	public _id: string;
	@Prop({ type: String, index: true })
	public user_id: string;

	@Prop({ type: String })
	public bio: string;

	@Prop({ type: [{ type: Types.ObjectId, ref: "UserRoadmap" }] })
	public roadmaps: Types.ObjectId[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ user_id: 1 });
