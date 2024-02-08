import OpenAI from "openai";

import mediumTemplate from "./prompts/generate-medium-roadmap";
import smallTemplate from "./prompts/generate-small-roadmap";
import getConfig from "../../../config/config";

const environment = getConfig();
const openai = new OpenAI({
	apiKey: environment.openai.dimaApiKey,
});

export type AiOutputRoadmap = {
	title: string;
	children: AiOutputRoadmap[];
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
	}
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: template,
			},
		],
		model: "gpt-3.5-turbo-1106",
		response_format: { type: "json_object" },
		max_tokens: 1500,
	});
	return JSON.parse(completion.choices[0].message.content) as AiOutputRoadmap;
}
