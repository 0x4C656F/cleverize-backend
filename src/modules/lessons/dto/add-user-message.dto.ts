import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsString } from "class-validator";

export enum MessageRole {
	USER = "user", // TODO
}

export class AddUserMessageDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public lessonId: string;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmapId: string;

	@IsEnum(MessageRole)
	@ApiProperty({ enum: MessageRole, example: "user" })
	public role: MessageRole;

	@IsString()
	@ApiProperty({ example: "message" })
	public content: string;
}

export class AddUserMessageBodyDto extends OmitType(AddUserMessageDto, [
	"lessonId",
	"user_id",
]) {}
