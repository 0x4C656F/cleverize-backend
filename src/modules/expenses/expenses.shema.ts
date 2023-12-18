import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type Cost = {
	inputCost: string;
	outputCost: string;
	totalCost: string;
	model: "3" | "4";
};

type Usage = {
	completion_tokens: number;
	prompt_tokens: number;
	total_tokens: number;
};

@Schema()
export class Expense {
	@Prop({ type: [{ type: Object }] })
	usage: Usage;

	@Prop()
	title: undefined | string;

	@Prop()
	type: "conversation" | "roadmap";

	@Prop()
	action: "add message" | "generate roadmap" | "init conversation";

	@Prop({ type: [{ type: Object }] })
	cost: Cost;
}
export type ExpenseDocument = Expense & Document;

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
