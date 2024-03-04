import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false, collection: "refresh_tokens" })
export class RefreshToken extends Document {
	@Prop({ type: String, required: true })
	token: string;

	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	user_id: string;

	@Prop({ type: Boolean, required: true, default: false })
	is_revoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
