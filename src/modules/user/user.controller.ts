import { Controller, Post, Body, Get, Param } from "@nestjs/common";
// Remove unused imports like ConfigService, UseGuards if they are not used elsewhere

import getConfig from "src/config/config";

import { UserService } from "./user.service";

// Define the type outside of the class to avoid ESLint errors
type Auth0TokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
};

@Controller("/users")
export class UserController {
	private readonly auth0Config: {
		audience: string;
		domain: string;
		clientId: string;
		clientSecret: string;
	};

	constructor(private readonly userService: UserService) {
		this.auth0Config = getConfig().auth0;
	}

	@Post()
	async upsertUser(@Body() userData: unknown): Promise<any> {
		return this.userService.findOrCreate(userData);
	}

	@Get("/all")
	async findAll(): Promise<any> {
		return this.userService.findAll();
	}

	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		const options = {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: `{
				"client_id": "${this.auth0Config.clientId}",
				"client_secret": "${this.auth0Config.clientSecret}",
				"audience": "${this.auth0Config.audience}",
				"grant_type": "client_credentials"
			}`,
		};
		try {
			const unparsedToken = await fetch(`${this.auth0Config.domain}/oauth/token`, options);
			const parsed: Auth0TokenResponse = (await unparsedToken.json()) as Auth0TokenResponse;
			const token: string = parsed.access_token;
			try {
				const response = await fetch(`${this.auth0Config.domain}/api/v2/users/${userId}`, {
					headers: { authorization: `Bearer ${token}` },
				});
				return (await response.json()) as unknown;
			} catch (error) {
				// eslint-disable-next-line security-node/detect-crlf
				console.log("User data fetch error", error);
			}
		} catch (error) {
			// eslint-disable-next-line security-node/detect-crlf
			console.log("Fetch token error", error);
		}
	}
}
