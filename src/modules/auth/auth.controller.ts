import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("sign-up")
	async signUp(@Body() dto: SignUpDto, @Res() response: Response) {
		const { _rt, _at } =  await this.authService.registerUser(dto);
		response.cookie("refresh_token", _rt, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
		response.cookie("access_token", _at, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
		return { access_token: _at };
	}

	@Post("sign-in")
	signIn(@Body() dto: SignInDto) {
		return this.authService.loginUser(dto);
	}

	@Post("refresh-token")
	refresh(@Body("_rt") token: string) {
		return this.authService.refreshTokens(token);
	}
}
