import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class ToggleNodeIsCompletedDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmapId: string;

	@ApiProperty({ example: "Arrays" })
	public title: string;
}
