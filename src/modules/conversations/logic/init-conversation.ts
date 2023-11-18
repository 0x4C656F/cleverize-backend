import OpenAI from "openai";

import { template } from "./template";
const openai = new OpenAI({
	apiKey: "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",
});
export default async function generateAiLesson(title: string, roadmap: string) {
	return await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `${template}\nLesson Title: ${title}\nRoadmap: ${roadmap}`,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true,
	});
}
