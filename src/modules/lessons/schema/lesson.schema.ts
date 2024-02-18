import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export type Message = {
	role: string;
	content: string;
};

@Schema()
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
