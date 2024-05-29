import mediumTemplate from "../prompts/md-roadmap.prompt";
import smallTemplate from "../prompts/sm-roadmap.prompt";
import { RoadmapSize } from "../schema/roadmap-nodes.schema";

export default function getTemplate(size: RoadmapSize, title: string) {
	return size === RoadmapSize.SMALL ? smallTemplate(title) : mediumTemplate(title);
}
