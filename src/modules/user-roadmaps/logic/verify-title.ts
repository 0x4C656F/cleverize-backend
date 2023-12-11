import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import OpenAI from "openai";
const openai = new OpenAI({
	apiKey: "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",
});
const template = (title: string) => {
	return `
    You are technology verifier bot. Your mission is to verify if ${title} aligns with the given parameters.
    You must output JSON only.
    Parameter 1: Type\n
    You have to decide whether ${title} is digital tech.
    If ${title} is digital, proceed to the next parameter check.
    If ${title} is not digital, return JSON error which looks like this: 
    {
        error: '${title} is not digital technology',
        description: '1 sentence description for this error'
    }\n
    
    Parameter 2: Size\n
    There are 3 sizes: sm(small), md(medium) and lg(large).\n
    Sm (Small): This size represents specific tools or libraries within a programming ecosystem. These are typically components of larger systems, and each serves a specialized function. Think of them as the individual tools in a toolbox – essential for specific tasks but part of a bigger picture. Examples: (next js, react, typescript, swift, flask)
    
    Md (Medium): This size refers to programming languages. Languages are broader in scope than individual tools or libraries. They form the foundation upon which software is built and are akin to the fundamental knowledge or skills needed in construction, like knowing how to read blueprints or understanding building materials. Examples: (java, python, c++, sql, javascript)
    
    Lg (Large): This size denotes entire digital professions. Professions encompass a wide range of skills and knowledge, integrating various tools (Sm) and languages (Md) to create complete solutions in a specific field. They can be compared to entire job roles in a construction project, like an architect or an engineer, who use a variety of tools and skills to accomplish their objectives. Example: (data science, frontend, backend, machine learning)
    You have to decide which size is applicable to ${title}.
    When decided, return JSON {
        size: '{chosen size(sm or md or lg)}'
    }
        `;
};

export default async function getRoadmapSize(title: string) {
	type errorResponseType = {
		error: string;
		description: string;
	};
	type acceptedResponseType = {
		size: "sm" | "md" | "lg";
	};
	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: template(title),
				},
			],
			model: "gpt-4-1106-preview",
			response_format: { type: "json_object" },
		});
		const response = JSON.parse(completion.choices[0].message.content) as errorResponseType &
			acceptedResponseType;
		if (response.error) {
			throw new HttpException(response, HttpStatus.BAD_REQUEST);
		} else {
			return response as acceptedResponseType;
		}
	} catch (error) {
		Logger.error(error);
	}
}
