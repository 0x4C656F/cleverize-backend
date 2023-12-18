export function calculateExpenses(
	inputTokens: number,
	outputTokens: number,
	model: "3" | "4"
): Cost {
	let pricing: {
		inputPrice: number;
		outputPrice: number;
	};
	if (model === "3") {
		pricing = {
			inputPrice: 0.001,
			outputPrice: 0.002,
		};
	} else {
		pricing = {
			inputPrice: 0.01,
			outputPrice: 0.03,
		};
	}
	const inputTokensPrice = (inputTokens / 1000) * pricing.inputPrice;
	const outputTokensPrice = (outputTokens / 1000) * pricing.outputPrice;
	const totalPrice = outputTokensPrice + inputTokensPrice;
	return {
		inputCost: "$" + inputTokensPrice,
		outputCost: "$" + inputTokensPrice,
		totalCost: "$" + totalPrice,
		model,
	};
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Cost, Expense, ExpenseDocument } from "./expenses.shema";

@Injectable()
export class ExpensesService {
	constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>) {}

	async addExpense(expense: Expense): Promise<void> {
		try {
			const createdExpense = new this.expenseModel(expense);
			await createdExpense.save();
		} catch (error) {
			console.log(error);
		}
	}
}
