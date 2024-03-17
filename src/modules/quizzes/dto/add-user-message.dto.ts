import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";

export enum MessageRole {
	USER = "user", // TODO
}

export class AddUserMessageDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public quizId: string;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;

	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmapId: string;

	@IsString()
	@ApiProperty({ example: "message" })
	public content: string;
}

export class AddUserMessageBodyDto extends OmitType(AddUserMessageDto, ["quizId", "user_id"]) {}
