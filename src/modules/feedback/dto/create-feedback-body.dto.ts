import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateFeedbackBodyDto {
	@ApiProperty({ example: "I think that" })
	public feedback: string;
	
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	public rating: number;

	@ApiProperty({
		example: "507f191e810c19729de860ea",
		description:
			"Identifier for the conversation. Either conversation_id or roadmap_id must be provided, but not both.",
	})
	public conversation_id?: string;

	@ApiProperty({
		example: "507f191e810c19729de860ea",
		description:
			"Identifier for the roadmap. Either roadmap_id or conversation_id must be provided, but not both.",
	})
	public roadmap_id?: string;
}
