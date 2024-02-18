import { users } from "@clerk/clerk-sdk-node";
import { Controller, Post, Get, Param, UseGuards, Req, RawBodyRequest } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService } from "./user.service";

@Controller("/users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	async upsertUser(@Req() request: RawBodyRequest<Request>): Promise<any> {
		return this.userService.findOrCreate(request);
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		return await users.getUser(userId);
	}
}
