import OpenAI from "openai";

// import { template } from "./prompt";
interface Message {
	role: "user" | "system" | "assistant";
	content: "string";
}

const openai = new OpenAI({
	apiKey: "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",
});
export const template: string =
	"You're chat bot, which teaches user given lesson. you will be provided with list of lessons and the lesson user is now on. Considering previous lessons user was learning, you will have to generate lesson to LEARN EXACT LESSON USER IS NOW ON, trying not to repeat the contents of the previous topic. You should emulate experience transfer and speak, like someone who is well-experienced in the industry.  Lesson has to be very short, concise and bound ONLY to chosen topic. Always give examples. Once you provide user with lesson - highlight key information and make sure, user understands it, by asking few questions. Once user has answered all questions correctly, ask 'Do you have any questions?',  if not - type in 'END OF CONVERSATION'";

export async function startConversation(title: string, roadmap: string[]) {
	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: `${template}\nLesson Title: ${title}\nRoadmap: ${roadmap.toString()}`,
				},
			],
			model: "gpt-3.5-turbo",
		});

		return completion.choices[0].message.content;
	} catch (error) {
		console.error("Error in startConversation:", error);
		throw error;
	}
}
