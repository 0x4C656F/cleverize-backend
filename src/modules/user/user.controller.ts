import clerkClient from "@clerk/clerk-sdk-node";
import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService } from "./user.service";

@Controller("/users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async upsertUser(@Body() userData: { data: { user_id: string } }): Promise<any> {
		return this.userService.findOrCreate(userData);
	}

	@Get("/all")
	async findAll(): Promise<any> {
		return this.userService.findAll();
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		// eslint-disable-next-line import/no-named-as-default-member
		return await clerkClient.users.getUser(userId);
	}
}
