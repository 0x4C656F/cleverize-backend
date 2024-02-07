import OpenAI from "openai";

import type { AiOutputRoadmap } from "src/modules/user-roadmaps/logic/generate-roadmap";

import { formattedPrompt } from "./conversation-prompt";

const openai = new OpenAI({
	apiKey: "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",
});
export default async function generateAiLesson(
	title: string,
	finalRoadmapTitle: string,
	roadmap: {
		title: string;
		children: AiOutputRoadmap[];
	}[],
	language: "english" | "russian"
) {
	return await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: formattedPrompt(language, title, roadmap, finalRoadmapTitle),
			},
		],
		model: "gpt-3.5-turbo-1106",
		stream: true,
		max_tokens: 2000,
	});
}
