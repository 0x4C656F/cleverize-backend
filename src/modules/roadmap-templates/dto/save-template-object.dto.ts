import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

import { RoadmapSize } from "src/modules/roadmap-nodes/schema/roadmap-nodes.schema";

export class TemplateObjectNode {
	@IsString()
	public title: string;
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TemplateObjectNode)
	public children?: TemplateObjectNode[];
	public _id?: string;
	
}

export class SaveTemplateObjectDto extends TemplateObjectNode {
	@IsString()
	public size: RoadmapSize;
}
