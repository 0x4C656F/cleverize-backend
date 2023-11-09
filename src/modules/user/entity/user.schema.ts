import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class User {
	public _id: Types.ObjectId;

	@Prop({ type: Types.ObjectId, index: true })
	public user_id: Types.ObjectId;

	@Prop({ type: String })
	public bio: string;

	@Prop({ type: [{ type: Types.ObjectId, ref: "UserRoadmap" }] })
	public roadmaps: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId }] })
	public achievements: Types.ObjectId[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ user_id: 1 });
