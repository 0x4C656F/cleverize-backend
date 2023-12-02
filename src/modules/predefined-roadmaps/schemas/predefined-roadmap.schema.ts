import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsArray, IsBoolean, IsString } from "class-validator";
import { Document, Types } from "mongoose";

import { User } from "src/modules/user/entity/user.schema";

export class SubRoadmap {
	@IsString()
	public title: string;

	@IsArray()
	@IsString({ each: true })
	public node_list: { title: string; isComplted: boolean }[];

	@IsBoolean()
	public isCompleted: boolean;
}

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class PredefinedRoadmap {
	public _id: Types.ObjectId;

	@Prop({ required: true, type: String, ref: "User", index: true })
	public owner_id: User;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public sub_roadmaps_list: SubRoadmap[];

	public created_at: Date;

	public updated_at: Date;
}

export type PredefinedRoadmapDocument = PredefinedRoadmap & Document;

export const PredefinedRoadmapSchema = SchemaFactory.createForClass(PredefinedRoadmap);
