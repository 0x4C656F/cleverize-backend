import { users } from "@clerk/clerk-sdk-node";
import { Controller, Post, Body, Get, Param, UseGuards, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

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

	@Get("/me/credits")
	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	async getCreditsByUserId(@UserPayload() payload: JWTPayload): Promise<number | undefined> {
		const user = await this.userModel.findOne({ user_id: payload.sub });

		if (!user) throw new NotFoundException("User was not found");

		if (!user.credits) return 0;

		return user.credits;
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		return await users.getUser(userId);
	}
}
