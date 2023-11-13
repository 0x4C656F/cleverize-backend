import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "src/modules/user/entity/user.schema";

export type UserRoadmapNode = {
	title: string;
	node_list: [];
	isCompleted: boolean;
};

@Schema()
export class UserRoadmap {
	public _id: Types.ObjectId;

	@Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
	public owner_id: User;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public node_list: UserRoadmapNode[];

	@Prop({ required: true })
	public isCompleted: boolean;

	@Prop()
	public created_at: Date;
}

export type UserRoadmapDocument = UserRoadmap & Document;

export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
