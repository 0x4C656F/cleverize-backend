import OpenAI from "openai";

import { template } from "./prompt";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateRoadmap(title: string) {
	
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: template },
			{
				role: "user",
				content: ``,
			},
		],
		model: "gpt-3.5-turbo",
	});
	return completion.choices[0].message.content;
}
