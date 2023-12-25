import OpenAI from "openai";

import { Expense } from "src/modules/expenses/expenses.shema";
import { calculateExpenses } from "src/modules/expenses/get-cost";

import largeTemplate from "./prompts/generate-large-roadmap";
import mediumTemplate from "./prompts/generate-medium-roadmap";
import smallTemplate from "./prompts/generate-small-roadmap";
import getConfig from "../../../config/config";

const environment = getConfig();
const openai = new OpenAI({
	apiKey: environment.openai.dimaApiKey,
});

export type AiOutputRoadmap = {
	title: string;
	children: AiOutputRoadmap[];
};
export default async function generateRoadmap(
	title: string,
	size: "sm" | "md" | "lg",
	expenseCallback?: (expense: Expense) => Promise<void>
): Promise<AiOutputRoadmap> {
	let template: string;
	switch (size) {
		case "sm": {
			template = smallTemplate(title);
			break;
		}
		case "md": {
			template = mediumTemplate(title);
			break;
		}
		case "lg": {
			template = largeTemplate(title);
			break;
		}
	}
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: template,
			},
		],
		model: "gpt-4-1106-preview",
		response_format: { type: "json_object" },
		max_tokens: 1500,
	});
	const response = JSON.parse(completion.choices[0].message.content) as AiOutputRoadmap;
	const { completion_tokens, prompt_tokens, total_tokens } = completion.usage;
	const expense: Expense = {
		usage: {
			completion_tokens,
			prompt_tokens,
			total_tokens,
		},
		date: new Date(),
		title: response.title,
		type: "roadmap",
		action: "generate roadmap",
		cost: calculateExpenses(completion_tokens, prompt_tokens, "4"),
	};
	await expenseCallback(expense);
	return response;
}
