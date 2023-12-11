import * as dotenv from "dotenv";
dotenv.config();
export type Config = {
	port: number;
	mongodbURI: string;
	auth0: {
		audience: string;
		domain: string;
		clientId: string;
		clientSecret: string;
	};
	stripe: string;
	openai: {
		dimaApiKey: string;
		levApiKey: string;
	};
};
export type Auth0Config = Config["auth0"];

export default () => {
	return {
		port: Number.parseInt(process.env.PORT, 10) || 80,
		mongodbURI: process.env.MONGODB_URI,
		auth0: {
			audience: process.env.AUTH0_AUDIENCE,
			domain: process.env.AUTH0_DOMAIN,
			clientId: process.env.AUTH0_CLIENT_ID,
			clientSecret: process.env.AUTH0_CLIENT_SECRET,
		},
		stripe: process.env.STRIPE_SECRET,
		openai: {
			dimaApiKey: process.env.DIMA_API_KEY,
			levApiKey: process.env.LEV_API_KEY,
		},
	};
};
