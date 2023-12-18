import { appendFile } from "node:fs";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { calculateExpenses } from "src/common/calculate-expenses";

import { Message } from "../schemas/conversation.schema";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateResponse(messages: Message[]) {
	const response = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model: "gpt-3.5-turbo-16k",
		stream: true,
		max_tokens: 1500,
	});
	let prompt_tokens = 0;
	messages.map((message) => {
		prompt_tokens += message.content.length / 4;
	});
	const completion_tokens = 280;
	appendFile(
		"usage.txt",
		JSON.stringify({
			usage: {
				completion_tokens,
				prompt_tokens,
				total_tokens: completion_tokens + prompt_tokens,
			},
			title: undefined,
			type: "conversation",
			action: "add message",
			cost: calculateExpenses(prompt_tokens, completion_tokens, "3"),
		}),
		(error) => {
			if (error) throw error;
			console.log("The file has been updated!");
		}
	);
	return response;
}
// The average of 283, 234, 282, 316, 396, 209 is approximately 286.67
