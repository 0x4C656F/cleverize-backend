import { appendFile } from "node:fs";

import OpenAI from "openai";

import { calculateExpenses } from "src/common/calculate-expenses";

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
	language: "english" | "russian"
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
