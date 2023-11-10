import OpenAI from "openai";
export async function generateRoadmap(title: string): Promise<string> {
	const openai = new OpenAI({
		apiKey: "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",
	});
	const thread = await openai.beta.threads.create({});
	await openai.beta.threads.messages.create(thread.id, {
		role: "user",
		content: title,
	});
	const run = await openai.beta.threads.runs.create(thread.id, {
		assistant_id: "asst_7AP7dgQppWPcwd8eXSg8TCUI",
	});
	let run_status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
	while (run_status.status !== "completed") {
		await new Promise((resolve) => setTimeout(resolve, 1500));

		run_status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
	}
	const messages = await openai.beta.threads.messages.list(thread.id);
	const response = messages.data[0];

	const message = await openai.beta.threads.messages.retrieve(thread.id, response.id);
	const content = message.content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
	const roadmap = content.text.value;
	await openai.beta.threads.del(thread.id);
	return roadmap;
}
