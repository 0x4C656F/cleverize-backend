import { RoadmapNode } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";
import { RawRoadmap } from "src/modules/roadmap-nodes/types/raw-roadmap";


export default function roadmapParser(user_roadmap: RoadmapNode): RawRoadmap[] {
	const roadmap: RawRoadmap[] = user_roadmap.children.map((subroadmap) => {
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
