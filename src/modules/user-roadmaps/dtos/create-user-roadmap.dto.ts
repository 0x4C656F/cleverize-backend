import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class CreateUserRoadmapDto {
	@IsMongoId()
	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public ownerId: string;
}

export class CreateUserRoadmapParametersDto extends PickType(CreateUserRoadmapDto, ["ownerId"]) {}

export class CreateUserRoadmapBodyDto extends OmitType(CreateUserRoadmapDto, ["ownerId"]) {}
