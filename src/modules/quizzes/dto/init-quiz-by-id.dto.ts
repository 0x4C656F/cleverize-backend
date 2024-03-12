import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";

export class InitQuizByIdDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public quizId: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	roadmapId: string;

	@IsString()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public user_id: string;
}

export class InitQuizByIdBodyDto extends OmitType(InitQuizByIdDto, ["quizId", "user_id"]) {}
