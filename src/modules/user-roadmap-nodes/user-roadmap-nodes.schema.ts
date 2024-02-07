import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "src/modules/user/entity/user.schema";

export enum RoadmapSize {
	SMALL = "sm",
	MEDIUM = "md",
	LARGE = "lg",
}

export const UserRoadmapNodesCollectionName = "user_roadmap_nodes";

@Schema({ collection: UserRoadmapNodesCollectionName, timestamps: { createdAt: "created_at" } })
export class UserRoadmapNode {
	public _id: Types.ObjectId;

	@Prop({ type: String, ref: "User" })
	public owner_id: User;

	@Prop({ type: String, enum: RoadmapSize })
	public size: RoadmapSize;

	@Prop()
	public conversation_id?: string;

	@Prop({type: Types.ObjectId, ref: UserRoadmapNode.name})
	public parent_id?: string;

	@Prop({ required: true })
	public title: string;

	@Prop({ required: true })
	public is_completed: boolean;

	@Prop({ required: true, type: [Types.ObjectId], ref: UserRoadmapNode.name, index: true })
	public children: UserRoadmapNode[];

	public created_at: Date;
}

export type UserRoadmapNodeDocument = UserRoadmapNode & Document;

export const UserRoadmapNodeSchema = SchemaFactory.createForClass(UserRoadmapNode);

UserRoadmapNodeSchema.pre("find", function (next) {
	void this.populate("children");
	next();
});
