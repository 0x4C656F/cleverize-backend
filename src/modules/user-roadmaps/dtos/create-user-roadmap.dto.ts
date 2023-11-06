import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserRoadmapDto {
	@IsString()
	@ApiProperty({ example: "Next.js frontend developer" })
	public title: string;
}
