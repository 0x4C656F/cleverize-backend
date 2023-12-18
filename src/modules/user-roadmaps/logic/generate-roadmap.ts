import { appendFile } from "node:fs";

import OpenAI from "openai";

import { calculateExpenses } from "src/common/calculate-expenses";

import largeTemplate from "./prompts/generate-large-roadmap";
import mediumTemplate from "./prompts/generate-medium-roadmap";
import smallTemplate from "./prompts/generate-small-roadmap";
import getConfig from "../../../config/config";

const environment = getConfig();
const openai = new OpenAI({
	apiKey: environment.openai.dimaApiKey,
});

type AiOutputRoadmap = {
	title: string;
	children: {
		title: string;
		children: string[];
	}[];
};
export default async function generateRoadmap(
	title: string,
	size: "sm" | "md" | "lg"
): Promise<AiOutputRoadmap> {
	let template: string;
	switch (size) {
		case "sm": {
			template = smallTemplate(title);
			break;
		}
		case "md": {
			template = mediumTemplate(title);
			break;
		}
		case "lg": {
			template = largeTemplate(title);
			break;
		}
	}
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: template,
			},
		],
		model: "gpt-4-1106-preview",
		response_format: { type: "json_object" },
		max_tokens: 1200,
	});
	const response = JSON.parse(completion.choices[0].message.content) as AiOutputRoadmap;

	appendFile(
		"usage.txt",
		JSON.stringify({
			usage: completion.usage,
			title: response.title,
			type: "roadmap",
			action: "create",
			cost: calculateExpenses(
				completion.usage.prompt_tokens,
				completion.usage.completion_tokens,
				"4"
			),
		}),
		(error) => {
			if (error) throw error;
			console.log("The file has been updated!");
		}
	);
	return response;
}
