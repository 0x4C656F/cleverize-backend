import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";
import { Expense, ExpenseSchema } from "./expenses.shema";

@Module({
	controllers: [ExpensesController],
	providers: [ExpensesService],
	imports: [MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }])],
})
export class ExpensesModule {}
