import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
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
	@Post("/call")
	async call(@Body() data): Promise<void> {
		return this.userService.call(data.title, data.user_context);
	}
}
