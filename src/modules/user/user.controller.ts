import { users } from "@clerk/clerk-sdk-node";
import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Model } from "mongoose";

import { User, UserDocument } from "./entity/user.schema";
import { UserService } from "./user.service";

@Controller("/users")
export class UserController {
	constructor(
		private readonly userService: UserService,
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>
	) {}

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
		return await users.getUser(userId);
	}
}
