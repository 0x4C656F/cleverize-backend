import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export type Message = {
	role: string;
	content: string;
};

@Schema({	timestamps: {
	createdAt: "created_at", // Use `created_at` to store the created date
	updatedAt: "updated_at", // and `updated_at` to store the last updated date
},})
export class Lesson {
	public _id: Types.ObjectId;

	@Prop({ required: true })
	public title: string;

	@Prop({ type: Types.ObjectId, required: true, ref: RoadmapNodesCollectionName })
	public node_id: string;

	@Prop({ type: [{ type: Object }] })
	public messages: Message[];
}

export type LessonDocument = Lesson & Document;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
