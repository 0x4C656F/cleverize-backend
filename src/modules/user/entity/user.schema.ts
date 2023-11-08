import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User {
	@Prop({ required: true, unique: true })
	user_id: string;
	@Prop({})
	bio: string;
	@Prop()
	roadmaps: [];

	@Prop()
	achievements: [];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
