import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { User } from "./schema/user.schema";
import { UsersService } from "./users.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("/users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(AuthGuard)
	@Get("all")
	async getAllUsers() {
		return await this.usersService.getAll();
	}

	@UseGuards(AuthGuard)
	@Get("/me")
	async getMe(@UserPayload() payload: JWTPayload): Promise<User> {
		return await this.usersService.findById(payload.sub);
	}

	@UseGuards(AuthGuard)
	@Patch("/me")
	async updateMe(@UserPayload() payload: JWTPayload, @Body() body: unknown) {
		return await this.usersService.update(payload.sub, body);
	}
}
