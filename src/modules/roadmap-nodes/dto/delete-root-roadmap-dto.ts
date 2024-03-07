import { ApiProperty,  } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";

export class DeleteRootRoadmapDto {
	@IsString()
	@IsMongoId()
	@ApiProperty({ example: "Python" })
	public id: string;

	@IsString()
	@ApiProperty({ example: "user_29w83sxmDNGwOuEthce5gg56FcC" })
	public user_id: string;
}
