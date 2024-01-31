import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { Expense } from "src/modules/expenses/expenses.shema";
import { calculateExpenses } from "src/modules/expenses/get-cost";

import { Message } from "../schemas/conversation.schema";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateResponse(
	messages: Message[],
	expenseCallback?: (expense: Expense) => Promise<void>
) {
	const response = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model: "gpt-3.5-turbo-16k",
		stream: true,
		max_tokens: 1000,
	});

	let prompt_tokens = 250;

	const completion_tokens = 1000;
	messages.map((message) => {
		prompt_tokens += message.content.length / 4;
	});

	const expense: Expense = {
		usage: {
			completion_tokens: completion_tokens,
			prompt_tokens: prompt_tokens,
			total_tokens: prompt_tokens + completion_tokens,
		},
		title: undefined,
		date: new Date(),

		type: "conversation",
		action: "add message",
		cost: calculateExpenses(prompt_tokens, completion_tokens, "3"),
	};

	await expenseCallback(expense);

	return response;
}
// The average of 283, 234, 282, 316, 396, 209 is approximately 286.67
