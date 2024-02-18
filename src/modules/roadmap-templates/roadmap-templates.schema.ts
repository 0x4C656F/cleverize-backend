import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { RoadmapSize } from "../roadmap-nodes/schema/roadmap-nodes.schema";

export const TemplateRoadmapNodesCollectionName = "template_roadmap_nodes";

@Schema({ collection: TemplateRoadmapNodesCollectionName, timestamps: { createdAt: "created_at" } })
export class TemplateRoadmapNode {
	public _id: Types.ObjectId;

	@Prop({ type: String, enum: RoadmapSize })
	public size: RoadmapSize;

	@Prop({ required: true })
	public title: string;

	@Prop({ ref: "TemplateConversation" })
	public lesson_id?: string;

	@Prop({ required: true, type: [Types.ObjectId], ref: TemplateRoadmapNode.name, index: true })
	public children: TemplateRoadmapNode[];

	public created_at: Date;
}

export type TemplateRoadmapNodeDocument = TemplateRoadmapNode & Document;

export const TemplateRoadmapNodeSchema = SchemaFactory.createForClass(TemplateRoadmapNode);

TemplateRoadmapNodeSchema.pre("findOne", function (next) {
	void this.populate({
		path: "children",
		model: TemplateRoadmapNode.name,
		populate: { path: "children", model: TemplateRoadmapNode.name },
	});
	next();
});
