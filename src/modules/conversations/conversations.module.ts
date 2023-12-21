import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { Expense, ExpenseSchema } from "../expenses/expenses.shema";
import {
	UserRoadmapNode,
	UserRoadmapNodeSchema,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		MongooseModule.forFeature([{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema }]),
		MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
	],
	controllers: [ConversationsController],
	providers: [ConversationsService, StreamService],
	exports: [],
})
export class ConversationsModule {}
