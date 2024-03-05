import * as dotenv from "dotenv";
dotenv.config();
export type Config = {
	port: number;
	mongodbURI: string;
	jwtSecret: string;
	stripe: string;
	stripeWebhook: string;
	openai: {
		dimaApiKey: string;
		levApiKey: string;
	};
};

export default (): Config => {
	return {
		port: Number.parseInt(process.env.PORT, 10) || 80,
		mongodbURI: process.env.MONGODB_URI,
		stripe: process.env.STRIPE_SECRET,
		jwtSecret: process.env.JWT_SECRET,
		stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET,
		openai: {
			dimaApiKey: process.env.DIMA_API_KEY,
			levApiKey: process.env.LEV_API_KEY,
		},
	};
};
