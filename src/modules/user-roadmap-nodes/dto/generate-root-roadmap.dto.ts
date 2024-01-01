import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsString } from "class-validator";

import { RoadmapSize } from "../user-roadmap-nodes.schema";

export class GenerateRootRoadmapDto {
	@IsString()
	@ApiProperty({ example: "Python" })
	public title: string;

	@IsString()
	@ApiProperty({ type: String, enum: RoadmapSize })
	public size: RoadmapSize;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}

export class GenerateRootRoadmapBodyDto extends OmitType(GenerateRootRoadmapDto, ["user_id"]) {}
