import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";

@Module({
	imports: [MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }])],
	controllers: [ConversationsController],
	providers: [ConversationsService, StreamService],
	exports: [],
})
export class ConversationsModule {}
