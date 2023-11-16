import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { UserRoadmap, UserRoadmapSchema } from "../user-roadmaps/user-roadmaps.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		MongooseModule.forFeature([{ name: UserRoadmap.name, schema: UserRoadmapSchema }]),
	],
	controllers: [ConversationsController],
	providers: [ConversationsService, StreamService],
	exports: [],
})
export class ConversationsModule {}
