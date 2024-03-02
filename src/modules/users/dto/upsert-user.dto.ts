import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpsertUserDto {
	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}
