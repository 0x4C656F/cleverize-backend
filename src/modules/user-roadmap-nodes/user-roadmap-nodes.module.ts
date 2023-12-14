import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRoadmapNodesController } from "./user-roadmap-nodes.controller";
import { UserRoadmapNode, UserRoadmapNodeSchema } from "./user-roadmap-nodes.schema";
import { UserRoadmapNodesService } from "./user-roadmap-nodes.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema }]),
	],
	controllers: [UserRoadmapNodesController],
	providers: [UserRoadmapNodesService],
	exports: [],
})
export class UserRoadmapNodesModule {}
