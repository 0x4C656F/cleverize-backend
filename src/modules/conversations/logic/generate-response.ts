import OpenAI from "openai";

import { template } from "./template";
const openai = new OpenAI({
	apiKey: "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",
});
export default async function generateResponse(messages: []) {
	return await openai.chat.completions.create({
		messages: [...messages],
		model: "gpt-3.5-turbo",
		stream: true,
	});
}
