import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  username: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  projects: [];

  @Prop()
  achievments: [];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
