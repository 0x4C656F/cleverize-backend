import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export type Message = {
	role: string;
	content: string;
};

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({
	timestamps: {
		createdAt: "created_at", // Use `created_at` to store the created date
		updatedAt: "updated_at", // and `updated_at` to store the last updated date
	},
})
export class Lesson {
	@Prop({ required: true })
	public title: string;

	@Prop({ type: Types.ObjectId, required: true, ref: RoadmapNodesCollectionName })
	public node_id: string;

	@Prop({ required: true, type: Types.ObjectId, ref: "User" })
	public owner_id: string;

	@Prop({ type: [{ type: Object }] })
	public messages: Message[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
