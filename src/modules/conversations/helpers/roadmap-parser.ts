import { UserRoadmapNode } from "src/modules/user-roadmap-nodes/user-roadmap-nodes.schema";

export default function roadmapParser(user_roadmap: UserRoadmapNode) {
	return user_roadmap.children.map((subroadmap) => {
		return {
			title: subroadmap.title,
			children: subroadmap.children.map((node) => node.title),
		};
	});
}
