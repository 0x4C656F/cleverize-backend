import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UserService } from "./user.service";
import generateRoadmap from "../ailogic/roadmapGenerator/generate_roadmap";

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
	public async call(@Body() body): Promise<string> {
		let res = await generateRoadmap(body.title);
		console.log(res);
		return res;
	}
}
