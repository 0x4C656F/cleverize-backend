import { IsMongoId } from "class-validator";

export class OperateUserRoadmapByIdDto {
	@IsMongoId()
	public userId: string;

	@IsMongoId()
	public roadmapId: string;
}
