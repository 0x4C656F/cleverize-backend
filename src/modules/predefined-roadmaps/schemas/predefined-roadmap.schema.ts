import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "src/modules/user/entity/user.schema";

export type SubRoadmap = {
	title: string;
	node_list: [];
	isCompleted: boolean;
};

@Schema({ timestamps: { createdAt: "created_at" } })
export class PredefinedRoadmap {
	public _id: Types.ObjectId;

	@Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
	public owner_id: User;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public sub_roadmaps_list: SubRoadmap[];

	public created_at: Date;
}

export type PredefinedRoadmapDocument = PredefinedRoadmap & Document;

export const PredefinedRoadmapSchema = SchemaFactory.createForClass(PredefinedRoadmap);
