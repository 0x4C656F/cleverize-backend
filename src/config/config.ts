export type Config = {
	port: number;
	mongodbURI: string;

	stripe: string;
	clerk: {
		clerkIssuerUrl: string;
	};
};

export default () => ({
	port: Number.parseInt(process.env.PORT, 10) || 80,
	mongodbURI: process.env.MONGODB_URI,
	clerk: {
		clerkIssuerUrl: process.env.CLERK_ISSUER_URL,
	},
	stripe: process.env.STRIPE_SECRET,
});
