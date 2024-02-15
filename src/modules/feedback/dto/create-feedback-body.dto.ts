import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, ValidateIf } from "class-validator";

export class CreateFeedbackBodyDto {
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversation_id?: string;

	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmap_id?: string;

	@ApiProperty({ example: "I think that" })
	public feedback: string;

	@ApiProperty({ example: 4, type: Number, minimum: 0, maximum: 5, required: true })
	public rating: number;
}
