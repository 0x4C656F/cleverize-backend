import { Controller, Post, Get, Param, UseGuards, Req, RawBodyRequest } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { UsersService } from "./users.service";

@Controller("/users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

}
