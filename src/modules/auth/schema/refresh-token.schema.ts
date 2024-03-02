import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

import { User } from "src/modules/users/schema/user.schema";

@Schema({ timestamps: true, versionKey: false, collection: "refresh_tokens" })
export class RefreshToken {
	@Prop()
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	token: string;

	@Prop({ type: Types.ObjectId, ref: User.name, required: true })
	user_id: string;

	@Prop({ type: Boolean, required: true, default: false })
	isRevoked: boolean;
}

export type RefreshTokenDocument = RefreshToken & Document;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
