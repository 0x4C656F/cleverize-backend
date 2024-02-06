import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RoadmapTemplatesController } from "./roadmap-templates.controller";
import { TemplateRoadmapNode, TemplateRoadmapNodeSchema } from "./roadmap-templates.schema";
import { RoadmapTemplatesService } from "./roadmap-templates.service";
import {
	TemplateConversation,
	TemplateConversationSchema,
} from "../conversations/schemas/conversation.schema";
import {
	UserRoadmapNode,
	UserRoadmapNodeSchema,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: TemplateRoadmapNode.name, schema: TemplateRoadmapNodeSchema },
			{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema },
			{ name: TemplateConversation.name, schema: TemplateConversationSchema },
		]),
	],
	controllers: [RoadmapTemplatesController],
	providers: [RoadmapTemplatesService],
	exports: [],
})
export class RoadmapTemplatesModule {}
