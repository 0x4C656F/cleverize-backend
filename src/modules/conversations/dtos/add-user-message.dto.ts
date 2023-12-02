import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsString } from "class-validator";

export enum MessageRole {
	USER = "user", // TODO
}

export class AddUserMessageDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversationId: string;

	@IsString()
	@ApiProperty({ example: "google-oauth2|116000322186574711788" })
	public ownerId: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public userRoadmapId: string;

	@IsEnum(MessageRole)
	@ApiProperty({ enum: MessageRole, example: "user" })
	public role: MessageRole;

	@IsString()
	@ApiProperty({ example: "message" })
	public content: string;
}

export class AddUserMessageBodyDto extends OmitType(AddUserMessageDto, [
	"conversationId",
	"ownerId",
]) {}
