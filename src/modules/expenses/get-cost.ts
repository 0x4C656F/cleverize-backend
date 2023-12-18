import { Cost } from "./expenses.shema";

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
	const inputTokensPrice = Number(((inputTokens / 1000) * pricing.inputPrice).toFixed(4));
	const outputTokensPrice = Number(((outputTokens / 1000) * pricing.outputPrice).toFixed(4));
	const totalPrice = Number((outputTokensPrice + inputTokensPrice).toFixed(4));
	return {
		inputCost: "$" + inputTokensPrice,
		outputCost: "$" + inputTokensPrice,
		totalCost: "$" + totalPrice,
		model,
	};
}
