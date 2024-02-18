import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export type Message = {
	role: string;
	content: string;
};

@Schema()
export class Quiz {
	public _id: Types.ObjectId;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public covered_material: [string];

	@Prop({ type: Types.ObjectId, required: true, ref: RoadmapNodesCollectionName })
	public node_id: string;

	@Prop({ type: [{ type: Object }], required: true})
	public messages: Message[];
}

export type QuizDocument = Quiz & Document;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
