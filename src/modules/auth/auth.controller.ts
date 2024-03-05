import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { Cookies } from "src/common/cookies.decorator";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("sign-up")
	async signUp(@Res({ passthrough: true }) response: Response, @Body() dto: SignUpDto) {
		return this.authService.registerUser(response, dto);
	}

	@Post("sign-in")
	signIn(@Res({ passthrough: true }) response: Response, @Body() dto: SignInDto) {
		return this.authService.loginUser(response, dto);
	}

	@Post("logout")
	logout(@Res({ passthrough: true }) response: Response) {
		return this.authService.logout(response);
	}

	@Post("refresh-token")
	refresh(@Res({ passthrough: true }) response: Response, @Cookies("refresh_token") token: string) {
		return this.authService.refreshTokens(response, token);
	}
}
