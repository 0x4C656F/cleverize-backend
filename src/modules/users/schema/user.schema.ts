import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import { SUPPORTED_LANGUAGES } from "src/common/constants";
import { RoadmapNodesCollectionName } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";
import { Subscription, subscriptionDefaultObject } from "src/modules/subscriptions/subscription";

export type Metadata = {
	language: SUPPORTED_LANGUAGES;
};

const defaultMetadata: Metadata = {
	language: SUPPORTED_LANGUAGES.ENGLISH,
};

export type UserDocument = HydratedDocument<User>;

@Schema({
	timestamps: {
		createdAt: "created_at", // Use `created_at` to store the created date
		updatedAt: "updated_at", // and `updated_at` to store the last updated date
	},
})
export class User {
	_id: Types.ObjectId;

	@Prop({ type: String })
	name: string;

	@Prop({ type: String, unique: true, immutable: true, required: true })
	email: string;

	@Prop({ required: true, select: false })
	password: string;

	@Prop({ type: Object, default: defaultMetadata })
	metadata: Metadata;

	@Prop({ ref: "RefreshToken", required: true })
	refresh_tokens: string[];

	@Prop({ type: [{ type: Types.ObjectId, ref: RoadmapNodesCollectionName }] })
	roadmaps: Types.ObjectId[];

	@Prop({ type: Subscription, default: subscriptionDefaultObject })
	subscription: Subscription;

	@Prop({ type: Date, default: Date.now })
	last_signed_in: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
