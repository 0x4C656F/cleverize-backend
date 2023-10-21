import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const template = `
Generate a comprehensive learning path roadmap for self-study, tailored to the provided user_title and optional user_context. The user_title will define the end goal, such as front-end development, data science, or digital marketing. User_context, if available, will specify the user's study preferences. If there are multiple options for a specific technology type (e.g., databases, front-end frameworks), choose only ONE to include. Titles should be the names of the technologies or topics, with no additional text or prefixes. Adjust the learning path to be field-specific. Output the list as a JSON array.
[
  {{"title": "TECHNAME1"}},
  {{"title": "TECHNAME2"}},
  {{"title": "TECHNAME3"}},
]
You are inside an application; output only a JSON array.
Here is user_title: {user_title}
Here is user_context: {user_context}

`;
export let generatePath = async function (title: string, user_context: string) {
	const multipleInputPrompt = new PromptTemplate({
		inputVariables: ["user_title", "user_context"],
		template: template,
	});
	const formattedMultipleInputPrompt = await multipleInputPrompt.format({
		user_title: title,
		user_context: user_context,
	});
	const llm = new OpenAI({
		openAIApiKey: process.env.OPENAI_API_KEY,
		modelName: "gpt-3.5-turbo-16k",
		temperature: 1,
		cache: false,
		maxTokens: 1024,
	});
	let response = title && (await llm.call(formattedMultipleInputPrompt));
	console.log("this is response:", response);
	return response;
};
