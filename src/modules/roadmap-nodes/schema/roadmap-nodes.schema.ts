import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export enum RoadmapSize {
	SMALL = "sm",
	MEDIUM = "md",
	LARGE = "lg",
}

export const RoadmapNodesCollectionName = "roadmap_nodes";

@Schema({ collection: RoadmapNodesCollectionName, timestamps: { createdAt: "created_at" } })
export class RoadmapNode {
	public _id: Types.ObjectId;

	@Prop({ type: String, ref: 'User' })
	public owner_id: string;

	@Prop({ type: String, enum: RoadmapSize })
	public size: RoadmapSize;

	@Prop({ type: String, ref: "Lesson" })
	public lesson_id?: string;

	@Prop({ type: String, ref: "Quiz" })
	public quiz_id?: string;

	@Prop({ required: true })
	public title: string;

	@Prop()
	public parent_node_id?: string;

	@Prop({ required: true })
	public is_completed: boolean;

	@Prop({ required: true, type: [Types.ObjectId], ref: RoadmapNode.name, index: true })
	public children: RoadmapNode[];

	public created_at: Date;
}

export type RoadmapNodeDocument = RoadmapNode & Document;

export const RoadmapNodeSchema = SchemaFactory.createForClass(RoadmapNode);

RoadmapNodeSchema.pre("find", function (next) {
	void this.populate("children");
	next();
});
