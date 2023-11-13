import OpenAI from "openai";

import prompt from "./prompt";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateSubRoadmap(title: string, roadmap: string): Promise<string> {
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: prompt },
			{
				role: "user",
				content: `
			This is user's roadmap: ${roadmap}.
This is user's current topic: ${title}
			`,
			},
		],
		model: "gpt-4",
	});
	const text: string = completion.choices[0].message.content;
	console.log("generateRoadmap function output:", completion.choices[0].message.content);
	return text;
}
// export default async function generateSubroadmap(title: string, roadmap: string) {
// 	const generatorLLM = new OpenAI({
// 		openAIApiKey: ,
// 		temperature: 1,
// 		modelName: "gpt-4",
// 		cache: true,
// 	});
// 	const formatedPrompt = await prompt.format({
// 		title: title,
// 		roadmap: roadmap,
// 	});
// 	return await generatorLLM.call(formatedPrompt);
// }
