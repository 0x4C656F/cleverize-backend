import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

import { RoadmapSize } from "src/modules/user-roadmap-nodes/user-roadmap-nodes.schema";

export class TemplateObjectNode {
	@IsString()
	public title: string;
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateObjectNode)
	public children?: TemplateObjectNode[];
	public _id?: string;
	@ValidateNested({ each: true })
	public conversation_id?: string;
}

export class SaveTemplateObjectDto extends TemplateObjectNode {
	@IsString()
	public size: RoadmapSize;
}
