import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export type Message = {
	role: string;
	content: string;
};

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({
	timestamps: {
		createdAt: "created_at", // Use `created_at` to store the created date
		updatedAt: "updated_at", // and `updated_at` to store the last updated date
	},
})
export class Quiz {
	public _id: Types.ObjectId;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public covered_material: [string];

	@Prop({ type: Types.ObjectId, required: true, ref: RoadmapNodesCollectionName })
	public node_id: string;

	@Prop({ type: [{ type: Object }], required: true })
	public messages: Message[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
