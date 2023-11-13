import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }])],
	controllers: [ConversationsController],
	providers: [],
	exports: [],
})
export class ConversationsModule {}
