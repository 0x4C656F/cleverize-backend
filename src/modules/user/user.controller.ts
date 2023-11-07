import { Controller, Post, Body, UseGuards, Get, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService } from "./user.service";
@Controller("/users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async upsertUser(@Body() userData: any): Promise<any> {
		return await this.userService.findOrCreate(userData);
	}
	@Get("/all")
	async findAll(): Promise<any> {
		return this.userService.findAll();
	}
	@Get("/:userId")
	async getUserById(@Param() params) {
		var options = {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: '{"client_id":"ICJBY7GumBeBHu2wTgx1Xq16IrWlQnhw","client_secret":"8SpIYMZxasiHZDHld1MnVD-HdyGCSCdYJSRW4OAp6myBokTaH6rzPXp2GgielLh3","audience":"https://veritech.eu.auth0.com/api/v2/","grant_type":"client_credentials"}',
		};
		let res = await fetch("https://veritech.eu.auth0.com/oauth/token", options);
		let parsed = await res.json();
		let token = await parsed.access_token;
		let response = await fetch(`https://veritech.eu.auth0.com/api/v2/users/${params.userId}`, {
			headers: { authorization: `Bearer ${token}` },
		});
		let parsedUser = await response.json();
		return parsedUser;
	}
}
