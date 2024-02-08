import { users } from "@clerk/clerk-sdk-node";
import { Controller, Post, Get, Param, UseGuards, Req, RawBodyRequest } from "@nestjs/common";
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
	async upsertUser(@Req() request: RawBodyRequest<Request>): Promise<any> {
		return this.userService.findOrCreate(request);
	}



	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		return await users.getUser(userId);
	}
}
