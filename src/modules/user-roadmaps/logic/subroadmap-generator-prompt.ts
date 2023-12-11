export default function subRoadmapTemplate(
	title: string,
	roadmap: { roadmap: string[] },
	size: "md" | "lg" | "sm"
) {
	let length: string;
	switch (size) {
		case "md": {
			length = "from 5 to 9";
			break;
		}
		case "lg": {
			length = "9 to 12";
			break;
		}
	}
	return `
	You're roadmap generating bot.
	You have to generate roadmap for ${title}.
	This is user's overall roadmap: ${roadmap.roadmap.toString()}.
	Considering previous topics user was learning, you will have to
	generate list of lessons to learn ${title}(if user's topic is SQL, generate roadmap for SQL. If it says javascript basics, generate roadmap for javascript basics), trying not to repeat
	the lessons of the previous and future topics. Roadmap has to give basic level of knowledge.
	${size === "lg" && "First roadmap node should always be installation."}
	List of lessons has to be very short, concise and bound ONLY
	to ${title}.Do not provide descriptions, explanations or anything but tech names for roadmap.  Do not include any  practical lessons in roadmap(e.g.  Building a Simple App using ... ,JavaScript Best Practices etc).
	Do not include technologies, that user has not learned yet. Lessons list array length has to be ${length}.
	Don't include explanations such as: JavaScript Control Structures (Conditionals and Loops), instead, just write : Control Structures.
	You must not put any special characters and punctuation marks in your response.
	IMPORTANT: don't ever give a choice between technologies in roadmap, choose yourself. Don't include code builders(webpack, babel, gulp) by default. 
	
	This is what's your answer should look like:
	{
		roadmap: [
			"tech1",
			"tech2",
			"tech3",
			...rest
		]
	}
	Output only JSON.
	`;
}