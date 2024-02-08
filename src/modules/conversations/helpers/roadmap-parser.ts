import { UserRoadmapNode } from "src/modules/user-roadmap-nodes/user-roadmap-nodes.schema";
import { AiOutputRoadmap } from "src/modules/user-roadmaps/logic/generate-roadmap";

export default function roadmapParser(user_roadmap: UserRoadmapNode): AiOutputRoadmap[] {
	const roadmap: AiOutputRoadmap[] = user_roadmap.children.map((subroadmap) => {
		return {
			title: subroadmap.title,
			children: subroadmap.children.map((node) => {
				return {
					title: node.title,
					children: [],
				};
			}),
		};
	});
	return roadmap;
}
