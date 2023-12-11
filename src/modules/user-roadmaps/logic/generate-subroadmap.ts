import OpenAI from "openai";

import subRoadmapTemplate from "./subroadmap-generator-prompt";
import getConfig from "../../../config/config";
const environment = getConfig();
const openai = new OpenAI({
	apiKey: environment.openai.dimaApiKey,
});

export default async function generateSubRoadmap(
	title: string,
	roadmap: { roadmap: string[] },
	size: "md" | "lg" | "sm"
): Promise<{ roadmap: string[] }> {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: subRoadmapTemplate(title, roadmap, size),
			},
		],
		model: "gpt-4-1106-preview",
		response_format: { type: "json_object" },
	});
	return JSON.parse(completion.choices[0].message.content) as { roadmap: string[] };
}
