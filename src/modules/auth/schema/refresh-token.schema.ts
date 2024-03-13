import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
	timestamps: {
		createdAt: "created_at", // Use `created_at` to store the created date
		updatedAt: "updated_at", // and `updated_at` to store the last updated date
	},
	versionKey: false,
	collection: "refresh_tokens",
})
export class RefreshToken {
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	token: string;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	user_id: string;

	@Prop({ type: Boolean, required: true, default: false })
	is_revoked: boolean;
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
