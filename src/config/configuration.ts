import { config } from "dotenv";
config();

export type Config = {
	port: number;
	mongodbURI: string;
	geminiApiKey: string;
	auth: {
		jwtSecret: string;
		jwtMaxAge: string;
		jwtRefreshMaxAge: string;
	};
	stripe: string;
	stripeWebhook: string;
	stripePrice: string;
	openai: {
		dimaApiKey: string;
		levApiKey: string;
	};
};

export default function getConfiguration(): Config {
	return {
		port: Number.parseInt(process.env.PORT, 10) || 8000,
		mongodbURI: process.env.MONGODB_URI,
		geminiApiKey: process.env.GEMINI_API_KEY,
		auth: {
			jwtSecret: process.env.JWT_SECRET,
			jwtMaxAge: process.env.JWT_MAX_AGE,
			jwtRefreshMaxAge: process.env.JWT_REFRESH_MAX_AGE,
		},
		stripe: process.env.STRIPE_SECRET,
		stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET,
		stripePrice: process.env.STRIPE_PRICE,
		openai: {
			dimaApiKey: process.env.DIMA_API_KEY,
			levApiKey: process.env.LEV_API_KEY,
		},
	};
}
