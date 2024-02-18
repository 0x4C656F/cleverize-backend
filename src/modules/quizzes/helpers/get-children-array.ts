import { RoadmapNode } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export default function getChildrenArray(node: RoadmapNode): string[] {
	const children: string[] = [];

	let queue = [node];
	while (queue.length > 0) {
		const current = queue.shift();
		if (current) {
			if (current.lesson_id) {
				children.push(current.title);
			}
			if (current.children) {
				queue = [...queue, ...current.children];
			}
		}
	}
	return children;
}
