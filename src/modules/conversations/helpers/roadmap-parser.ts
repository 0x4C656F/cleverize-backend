import { UserRoadmap } from "src/modules/user-roadmaps/user-roadmaps.schema";

export default function roadmapParser(user_roadmap: UserRoadmap) {
	const resultRoadmap: { title: string; children: string[] }[] = [];
	user_roadmap.sub_roadmap_list.map((subroadmap) => {
		resultRoadmap.push({
			title: subroadmap.title,
			children: subroadmap.node_list.map((node) => node.title),
		});
	});
	return resultRoadmap;
}
