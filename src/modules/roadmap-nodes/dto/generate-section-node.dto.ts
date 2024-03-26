import { OmitType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export default class GenerateSectionNodeDto {
	@IsString()
	@IsNotEmpty()
	readonly title: string;

	@IsMongoId()
	@IsNotEmpty()
	readonly roadmap_id: string;

	@IsMongoId()
	@IsNotEmpty()
	readonly section_id: string;

	@IsString()
	@IsNotEmpty()
	readonly owner_id: string;
}

export class GenerateSectionNodeBodyDto extends OmitType(GenerateSectionNodeDto, ["owner_id"]) {}
