// import { OpenAI } from "langchain/llms/openai";

// import prompt from "./prompt";
// export default async function (title: string) {
// 	const generatorLLM = new OpenAI({
// 		openAIApiKey: "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",
// 		temperature: 1,
// 		modelName: "gpt-4",
// 		cache: true,
// 	});
// 	const formatedPrompt = await prompt.format({
// 		title: title,
// 	});
// 	return await generatorLLM.call(formatedPrompt);
// }
import OpenAI from "openai";

import prompt from "./prompt";

const openai = new OpenAI({
	apiKey: "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",
});

export default async function generateRoadmap(title: string) {
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: prompt },
			{
				role: "user",
				content: `
				This is tech you have to generate roadmap for: ${title}
			`,
			},
		],
		model: "gpt-4",
	});
	console.log("generateRoadmap function output:", completion.choices[0].message.content);
	return completion.choices[0].message.content;
}
