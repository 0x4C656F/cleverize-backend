import { User } from "@clerk/clerk-sdk-node";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RoadmapTemplatesController } from "./roadmap-templates.controller";
import { TemplateRoadmapNode, TemplateRoadmapNodeSchema } from "./roadmap-templates.schema";
import { RoadmapTemplatesService } from "./roadmap-templates.service";
import { Conversation, ConversationSchema } from "../conversations/schemas/conversation.schema";
import { UserSchema } from "../user/entity/user.schema";
import {
	UserRoadmapNode,
	UserRoadmapNodeSchema,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: TemplateRoadmapNode.name, schema: TemplateRoadmapNodeSchema },
			{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema },
			{ name: Conversation.name, schema: ConversationSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [RoadmapTemplatesController],
	providers: [RoadmapTemplatesService],
	exports: [],
})
export class RoadmapTemplatesModule {}
