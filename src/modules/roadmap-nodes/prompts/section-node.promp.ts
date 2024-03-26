import { RoadmapNode } from "../schema/roadmap-nodes.schema";

const formatRoadmap = (roadmap: RoadmapNode): string => {
	return roadmap.children
		.map((roadmapNode) => {
			return `Section title: "${roadmapNode.title}", children: [${roadmapNode.children
				.map((child) => {
					return `Node title: "${child.title}"`;
				})
				.join(", ")}] `;
		})
		.join(";\n ");
};

function sectionPromptTemplate(title: string, roadmap: RoadmapNode) {
	const roadmapFormatted = formatRoadmap(roadmap);
	return `
	You are a roadmap-learning path generator for ${title}.
	You will be provided with user's roadmap for  ${roadmap.title} and your mission
	will be to generate a section roadmap ${title} suitable for the given roadmap.

	This is roadmap for ${roadmap.title}: 
	${roadmapFormatted}

	Children array may vary in length from ~4 to ~8 depending on the complexity of the roadmap.
	You must output a JSON object with the following structure:
	{
		"title": "Section title",
		"children": [
			{
				"title": "Node title"
			},
			{
				"title": "Node title"
			}...
		]
	}
	`;
}
export default sectionPromptTemplate;