import { ApiProperty } from "@nestjs/swagger";
import { Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: false })
export class IsEitherConversationOrRoadmapPresent implements ValidatorConstraintInterface {
	validate(value: any): boolean {
		const { conversation_id, roadmap_id } = value as {
			conversation_id: string | undefined;
			roadmap_id: string | undefined;
		};
		return !!((conversation_id && !roadmap_id) || (!conversation_id && roadmap_id));
	}

	defaultMessage() {
		return "Either conversation_id or roadmap_id must be present, but not both";
	}
}

export class CreateFeedbackBodyDto {
	@ApiProperty({ example: "I think that" })
	public feedback: string;

	@ApiProperty({ example: 4, type: Number, minimum: 0, maximum: 5, required: true })
	public rating: number;

	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public conversation_id?: string;

	@ApiProperty({ example: "507f191e810c19729de860ea" })
	public roadmap_id?: string;

	@Validate(IsEitherConversationOrRoadmapPresent)
	public eitherConversationOrRoadmap: any;
}
