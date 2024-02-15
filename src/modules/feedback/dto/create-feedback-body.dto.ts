import { ApiProperty } from "@nestjs/swagger";

export class CreateFeedbackBodyDto {
    @ApiProperty({ example: "I think that" })
    public feedback: string;

    @ApiProperty({ example: 4, type: Number, minimum: 0, maximum: 5, required: true })
    public rating: number;

    @ApiProperty({
        example: "507f191e810c19729de860ea",
        description: "Identifier for the conversation. Either conversation_id or roadmap_id must be provided, but not both."
    })
    public conversation_id?: string;

    @ApiProperty({
        example: "507f191e810c19729de860ea",
        description: "Identifier for the roadmap. Either roadmap_id or conversation_id must be provided, but not both."
    })
    public roadmap_id?: string;
}
