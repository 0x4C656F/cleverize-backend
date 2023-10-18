import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Project {
	@Prop({ required: true, unique: true })
	project_id: string;

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	context: string;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project);
