import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateRootRoadmapBodyDto {
	@IsString()
	@ApiProperty({ example: "Python" })
	public title: string;
}
