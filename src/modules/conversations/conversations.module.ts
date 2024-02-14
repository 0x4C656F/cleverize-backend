import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../user/schema/user.schema";
import {
	UserRoadmapNode,
	UserRoadmapNodeSchema,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		MongooseModule.forFeature([{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [ConversationsController],
	providers: [ConversationsService, StreamService, SubscriptionsService],
	exports: [],
})
export class ConversationsModule {}
