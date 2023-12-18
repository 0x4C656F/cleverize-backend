import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { Conversation, ConversationSchema } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { ExpensesService } from "../expenses/expenses.service";
import { Expense, ExpenseSchema } from "../expenses/expenses.shema";
import { UserRoadmap, UserRoadmapSchema } from "../user-roadmaps/user-roadmaps.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		MongooseModule.forFeature([{ name: UserRoadmap.name, schema: UserRoadmapSchema }]),
		MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
	],
	controllers: [ConversationsController],
	providers: [ConversationsService, StreamService, ExpensesService],
	exports: [],
})
export class ConversationsModule {}
