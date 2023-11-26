import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { Message } from "../schemas/conversation.schema";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateResponse(messages: Message[]) {
	return await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model: "gpt-3.5-turbo",
		stream: true,
		max_tokens: 1500,
	});
}
