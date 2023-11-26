import { Subroadmap, UserRoadmap } from "src/modules/user-roadmaps/user-roadmaps.schema";

export default function (user_roadmap: UserRoadmap, title: string): Subroadmap {
	return user_roadmap.sub_roadmap_list.find((subroadmap) => {
		for (const tech of subroadmap.node_list) {
			if (tech.title === title) {
				return subroadmap;
			}
		}
	});
}