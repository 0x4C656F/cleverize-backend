import { ApiProperty } from "@nestjs/swagger";
export default class RestartQuizByIdDto {
	@ApiProperty({ required: true, example: "507f191e810c19729de860ea" })
	quizId: string;
}
