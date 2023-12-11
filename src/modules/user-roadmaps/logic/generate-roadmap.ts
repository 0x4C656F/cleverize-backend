import OpenAI from "openai";

import largeTemplate from "./prompts/generate-large-roadmap";
import mediumTemplate from "./prompts/generate-medium-roadmap";
import smallTemplate from "./prompts/generate-small-roadmap";
import getConfig from "../../../config/config";
const environment = getConfig();
const openai = new OpenAI({
	apiKey: environment.openai.dimaApiKey,
});

export default async function generateRoadmap(
	title: string,
	size: "sm" | "md" | "lg"
): Promise<{
	roadmap: string[];
}> {
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
	});

	return JSON.parse(completion.choices[0].message.content) as {
		roadmap: string[];
	};
}
