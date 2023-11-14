import OpenAI from "openai";

import prompt from "./prompt";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateSubRoadmap(
	title: string,
	roadmap: { roadmap: string[] }
): Promise<{ roadmap: string[] }> {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `${prompt}\n
				This is user's roadmap: ${JSON.stringify(roadmap)}.\n
				This is user's current topic: ${title}
			`,
			},
		],
		model: "gpt-4-1106-preview",
		response_format: { type: "json_object" },
	});
	return JSON.parse(completion.choices[0].message.content) as { roadmap: string[] };
}
