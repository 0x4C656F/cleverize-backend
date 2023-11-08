import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "src/modules/user/entity/user.schema";

export type UserRoadmapNode = {
	title: string;
	sub_roadmap_id: Types.ObjectId;
};

@Schema()
export class UserRoadmap {
	public _id: Types.ObjectId;

	@Prop({ required: true, type: Types.ObjectId, ref: "User" })
	public owner_id: User;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public node_list: UserRoadmapNode[];
}

export type UserRoadmapDocument = UserRoadmap & Document;

export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
