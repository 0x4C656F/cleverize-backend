import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: "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",
});
import prompt from "./prompt";

type outputType = {
	roadmap: string[];
};

export default async function generateRoadmap(title: string): Promise<outputType> {
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
	console.log("generateRoadmap function output:", completion.choices[0].message.content);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const reponseJSON: outputType = JSON.parse(completion.choices[0].message.content);
	return reponseJSON;
}
