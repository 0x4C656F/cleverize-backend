const config = {
	port: Number.parseInt(process.env.PORT, 10) || 80,
	mongodbURI: process.env.MONGODB_URI,
	auth0: {
		audience: process.env.AUTH0_AUDIENCE,
		domain: process.env.AUTH0_DOMAIN,
		clientId: process.env.AUTH0_CLIENT_ID,
		clientSecret: process.env.AUTH0_CLIENT_SECRET,
	},
};

export type Config = typeof config;
export type Auth0Config = typeof config.auth0;

export default () => config;
