import { UserRoadmapNode } from 'src/modules/user-roadmap-nodes/user-roadmap-nodes.schema';

export default function getChildrenArray(node: UserRoadmapNode): string[] {
    const children: string[] = [];

    let queue = [node];
	while (queue.length > 0) {
		const current = queue.shift();
		if (current) {
			if(current.conversation_id){
				children.push(current.title);
			}
			if (current.children) {
				queue = [...queue, ...current.children];
			}

		}
	}
	return children;
}