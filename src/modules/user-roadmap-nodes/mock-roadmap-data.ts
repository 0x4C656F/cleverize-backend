import { AiOutputRoadmap } from "../user-roadmaps/logic/generate-roadmap";

export const roadmap: AiOutputRoadmap = {
	title: "Example Roadmap",
	children: [
		{
			title: "Step 1",
			children: [
				{
					title: "Sub-step 1.1",
					children: [],
				},
			],
		},
		{
			title: "Step 2",
			children: [
				{
					title: "Sub-step 2.1",
					children: [],
				},
			],
		},
	],
};
