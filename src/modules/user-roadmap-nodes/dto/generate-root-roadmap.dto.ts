import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateRootRoadmapDto {
	@IsString()
	@ApiProperty({ example: "Python" })
	public title: string;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}
