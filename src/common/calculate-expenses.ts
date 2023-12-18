export function calculateExpenses(inputTokens: number, outputTokens: number, model: "3" | "4") {
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
		inputTokensPrice,
		outputTokensPrice,
		totalPrice,
		model,
	};
}
