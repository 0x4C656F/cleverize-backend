import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRoadmapsController } from "./user-roadmaps.controller";
import { UserRoadmap, UserRoadmapSchema } from "./user-roadmaps.schema";
import { UserRoadmapsService } from "./user-roadmaps.service";
import { Conversation, ConversationSchema } from "../conversations/schemas/conversation.schema";
import { ExpensesService } from "../expenses/expenses.service";
import { Expense, ExpenseSchema } from "../expenses/expenses.shema";
import { User, UserSchema } from "../user/entity/user.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserRoadmap.name, schema: UserRoadmapSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Conversation.name, schema: ConversationSchema },
			{ name: Expense.name, schema: ExpenseSchema },
		]),
	],
	controllers: [UserRoadmapsController],
	providers: [UserRoadmapsService, ExpensesService],
	exports: [],
})
export class UserRoadmapsModule {}
