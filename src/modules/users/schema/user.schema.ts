import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { RefreshToken } from "src/modules/auth/schema/refresh-token.schema";
import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";
import { Subscription, subscriptionDefaultObject } from "src/modules/subscriptions/subscription";

@Schema({ timestamps: true })
export class User {
	_id: Types.ObjectId;

	@Prop({ type: String })
	name: string;

	@Prop({ type: String, unique: true, required: true })
	email: string;

	@Prop({ required: true, select: false })
	password: string;

	@Prop({ ref: "RefreshToken", required: true })
	refresh_tokens: RefreshToken[];

	@Prop({ type: [{ type: Types.ObjectId, ref: RoadmapNodesCollectionName }] })
	roadmaps: Types.ObjectId[];

	@Prop({ type: Subscription, default: subscriptionDefaultObject })
	subscription: Subscription;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
