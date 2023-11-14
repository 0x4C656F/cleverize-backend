import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }])],
	controllers: [ConversationsController],
	providers: [ConversationsService],
	exports: [],
})
export class ConversationsModule {}
