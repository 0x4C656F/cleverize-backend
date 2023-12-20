import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRoadmapNodesController } from "./user-roadmap-nodes.controller";
import { UserRoadmapNode, UserRoadmapNodeSchema } from "./user-roadmap-nodes.schema";
import { UserRoadmapNodesService } from "./user-roadmap-nodes.service";
import { Conversation, ConversationSchema } from "../conversations/schemas/conversation.schema";
import { Expense, ExpenseSchema } from "../expenses/expenses.shema";
import { User, UserSchema } from "../user/entity/user.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserRoadmapNode.name, schema: UserRoadmapNodeSchema },
			{ name: Expense.name, schema: ExpenseSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Conversation.name, schema: ConversationSchema },
		]),
	],
	controllers: [UserRoadmapNodesController],
	providers: [UserRoadmapNodesService],
	exports: [],
})
export class UserRoadmapNodesModule {}
