import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class UserRoadmap {
	@Prop({ required: true, unique: true })
	id: string;
}

export type UserRoadmapDocument = UserRoadmap & Document;

export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
