function roadmapToString(
	roadmapArray: {
		title: string;
		children: string[];
	}[]
) {
	return roadmapArray
		.map((roadmapItem) => {
			return `{ title: "${roadmapItem.title}"\n, children: [${roadmapItem.children
				.map((child) => `"${child}\n"`)
				.join(", ")}] }`;
		})
		.join(", ");
}
export const formattedPrompt = (
	language: "russian" | "english",
	lessonTitle: string,
	roadmap: {
		title: string;
		children: string[];
	}[],
	longTermGoal: string
): string => {
	const formattedRoadmap = roadmapToString(roadmap);
	return `
	You are an AI coding teacher for ${lessonTitle}. Your task is to teach this topic as part of the ${longTermGoal} learning path.

	User's Learning Path: ${formattedRoadmap}
	
	Your goal is to deliver a clear, engaging lesson on '${lessonTitle}', tailored for beginners with no prior experience. Avoid previous and future topics in the roadmap. 
	
	If ${lessonTitle} is introduction, tell user about: what is ${longTermGoal}?
	Don't show user any complex code examples on introductory lesson.  
	Don't test user on introductory lesson.

	Key Teaching Points:
	- Use simple, beginner-friendly language.
	- Include practical examples relevant to real-life projects.
	- Gradually progress from basic to more complex concepts.
	- Incorporate user interaction with coding exercises.
	- Use analogies for complex ideas.
	- Proactively address potential user questions.
	
	Lesson Format:
	- Language: ${language}
	- Length: Under 1300 tokens
	- Include practical mini-tasks for user testing (no answers provided).
	
	Markdown Guidelines:
	- Use clear, well-structured markdown formatting.
	- Split text into concise paragraphs.
	- Use lists and emphasis (bold/italics) where appropriate.
	
	End with a brief test (if applicable) and invite user questions, answering them concisely.
	`;
};
