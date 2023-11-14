import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: "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",
});
import prompt from "./prompt";

export default async function generateRoadmap(title: string): Promise<{
	roadmap: string[];
}> {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `${prompt} \n This is tech you have to generate roadmap for: ${title}`,
			},
		],
		model: "gpt-4-1106-preview",
		response_format: { type: "json_object" },
	});

	return JSON.parse(completion.choices[0].message.content) as {
		roadmap: string[];
	};
}
