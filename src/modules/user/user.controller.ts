import { Controller, Post, Body, UseGuards, Get, Param } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UserService } from "./user.service";
import getConfig from "../../config/config";
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
	async upsertUser(@Body() userData: any): Promise<any> {
		return await this.userService.findOrCreate(userData);
	}
	@Get("/all")
	async findAll(): Promise<any> {
		return this.userService.findAll();
	}
	@Get("/:userId")
	async getUserById(@Param() parametrs) {
		const options = {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: `{
			"client_id":"${this.auth0Config.clientId}",
			"client_secret":"${this.auth0Config.clientSecret}",
			"audience":"${this.auth0Config.domain}/api/v2/",
			"grant_type":"client_credentials"
			}`,
		};
		const unparsedToken = await fetch(`${this.auth0Config.domain}/oauth/token`, options);
		const parsed = await unparsedToken.json();
		const token: string = await parsed.access_token;
		const response = await fetch(`${this.auth0Config.domain}/api/v2/users/${parametrs.userId}`, {
			headers: { authorization: `Bearer ${token}` },
		});
		return await response.json();
	}
}
