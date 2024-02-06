import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class InitConversationByIdDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversationId: string;

	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}
