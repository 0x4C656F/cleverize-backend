import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { UserRoadmap } from "src/modules/user-roadmaps/user-roadmaps.schema";

@Schema()
export class User {
	public _id: string;

	public user_id: string;

	@Prop({ type: String })
	public bio: string;

	@Prop({ type: [{ type: Types.ObjectId, ref: "UserRoadmap" }] })
	public roadmaps: [UserRoadmap];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
