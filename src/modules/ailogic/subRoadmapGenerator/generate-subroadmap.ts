import { OpenAI } from "langchain/llms/openai";

import prompt from "./prompt";
export default async function generateSubroadmap(title: string, roadmap: string) {
	const generatorLLM = new OpenAI({
		openAIApiKey: "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",
		temperature: 1,
		modelName: "gpt-4",
	});
	const formatedPrompt = await prompt.format({
		title: title,
		roadmap: roadmap,
	});
	return await generatorLLM.call(formatedPrompt);
}
