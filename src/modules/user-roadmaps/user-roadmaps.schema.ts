import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "../user/entity/user.schema";

@Schema()
export class UserRoadmap {
	public _id: Types.ObjectId;

	@Prop({ required: true, type: Types.ObjectId, ref: User.name })
	public owner_id: User;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public node_list: [];
}

export type UserRoadmapDocument = UserRoadmap & Document;

export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
