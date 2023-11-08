import { Controller, Post, Body, Get, Param } from "@nestjs/common";

// eslint-disable-next-line import/no-extraneous-dependencies
import axios from "axios";

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
		console.log(this.auth0Config.domain);
		const options = {
			method: "POST",
			url: `${this.auth0Config.domain}oauth/token`,
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "client_credentials",
				client_id: this.auth0Config.clientId,
				client_secret: this.auth0Config.clientSecret,
				audience: this.auth0Config.audience,
			}),
		};
		const axiosResponse = await axios(options);
		const data: Auth0TokenResponse = axiosResponse.data as Auth0TokenResponse;
		const token: string = data.access_token;
		const response = await fetch(`${this.auth0Config.domain}api/v2/users/${userId}`, {
			headers: { authorization: `Bearer ${token}` },
		});
		return (await response.json()) as unknown;
		// eslint-disable-next-line security-node/detect-crlf

		// eslint-disable-next-line security-node/detect-crlf
	}
}
