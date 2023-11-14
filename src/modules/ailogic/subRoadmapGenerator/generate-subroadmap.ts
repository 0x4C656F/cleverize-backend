import OpenAI from "openai";

import prompt from "./prompt";
const openai = new OpenAI({
	apiKey: "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",
});
type outputType = {
	roadmap: string[];
};

export default async function generateSubRoadmap(
	title: string,
	roadmap: { roadmap: string[] }
): Promise<outputType> {
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
	const dataJSON: outputType = JSON.parse(completion.choices[0].message.content) as outputType;
	return dataJSON;
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
