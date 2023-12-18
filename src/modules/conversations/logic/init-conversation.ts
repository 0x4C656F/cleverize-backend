import OpenAI from "openai";

import { calculateExpenses } from "src/modules/expenses/expenses.service";
import { Expense } from "src/modules/expenses/expenses.shema";

import { formattedPrompt } from "./conversation-prompt";

const openai = new OpenAI({
	apiKey: "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",
});
export default async function generateAiLesson(
	title: string,
	finalRoadmapTitle: string,
	roadmap: {
		title: string;
		children: string[];
	}[],
	language: "english" | "russian",
	expenseCallback?: (expense: Expense) => Promise<void>
) {
	const response = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: formattedPrompt(language, title, roadmap, finalRoadmapTitle),
			},
		],
		model: "gpt-3.5-turbo-1106",
		stream: true,
		max_tokens: 1300,
	});
	const prompt_tokens = formattedPrompt(language, title, roadmap, finalRoadmapTitle).length / 4;

	const completion_tokens = 650; //597 523 654 911 566 641 548 707 615 734
	const total_tokens = prompt_tokens + completion_tokens;
	const expense: Expense = {
		usage: {
			completion_tokens: completion_tokens,
			prompt_tokens: prompt_tokens,
			total_tokens: total_tokens,
		},
		title: undefined,
		type: "conversation",
		action: "init conversation",
		cost: calculateExpenses(prompt_tokens, completion_tokens, "3"),
	};
	await expenseCallback(expense);
	return response;
}
