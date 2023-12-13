import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsIn, IsMongoId, IsString } from "class-validator";

export class InitConversationByIdDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversationId: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	userRoadmapId: string;

	@IsString()
	@IsIn(["english", "russian"])
	@ApiProperty({ example: "english" })
	public language: "english" | "russian";
}

export class InitConversationByIdBodyDto extends OmitType(InitConversationByIdDto, [
	"conversationId",
]) {}
