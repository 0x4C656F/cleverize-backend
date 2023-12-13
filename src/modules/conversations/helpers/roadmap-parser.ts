import { Subroadmap, UserRoadmap } from "src/modules/user-roadmaps/user-roadmaps.schema";

export default function (user_roadmap: UserRoadmap, id: string): Subroadmap {
	return user_roadmap.sub_roadmap_list.find((subroadmap) => {
		for (const tech of subroadmap.node_list) {
			if (tech.conversation_id.toString().includes(id.toString())) {
				return subroadmap;
			}
		}
	});
}
