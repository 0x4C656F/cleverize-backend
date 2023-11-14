import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateConversationBodyDto {
	@IsString()
	@ApiProperty({ example: "Sample" }) // TODO
	public title: string;

	@IsArray()
	@ApiProperty({ example: [] }) // TODO
	public nodeList: Array<unknown>;
}
