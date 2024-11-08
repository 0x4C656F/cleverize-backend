import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";

export class InitLessonByIdDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public lessonId: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmap_id: string;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}

export class InitLessonByIdBodyDto extends OmitType(InitLessonByIdDto, ["lessonId", "user_id"]) {}
