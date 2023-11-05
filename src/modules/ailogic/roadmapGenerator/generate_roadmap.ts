import { OpenAI } from "langchain/llms/openai";
import prompt from "./prompt";
export default async function (title: string) {
	const generatorLLM = new OpenAI({
		openAIApiKey: "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",
		temperature: 0.4,
	});
	const formatedPrompt = await prompt.format({
		title: title,
	});
	const response = await generatorLLM.call(formatedPrompt);
	console.log(response);
	return response;
}
