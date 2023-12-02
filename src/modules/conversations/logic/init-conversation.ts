import OpenAI from "openai";

import { formatedPrompt } from "./starter-en-conversatioh";
const openai = new OpenAI({
	apiKey: "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",
});
export default async function generateAiLesson(
	title: string,
	roadmap_title: string,
	roadmap: string,
	language: "english" | "russian"
) {
	console.log("Starting generating ai lesson with");
	return await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `${formatedPrompt(
					language
				)}\nUser's tech goal: ${roadmap_title} \nCurrent lesson Title: ${title}\nRoadmap: ${roadmap}`,
			},
		],
		model: "gpt-3.5-turbo",
		stream: true,
		max_tokens: 1500,
	});
}
