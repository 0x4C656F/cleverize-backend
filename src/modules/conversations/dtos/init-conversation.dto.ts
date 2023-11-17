import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class InitConversationByIdDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversationId: string;
}
