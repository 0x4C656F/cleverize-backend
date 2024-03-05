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
		const { access_token, refresh_token } = await this.authService.registerUser(response, dto);
		response.cookie("access_token", access_token, {
			sameSite: false,
			secure: false,
			httpOnly: false,
			maxAge: 1000 * 60 * 60 * 24 * 3,
		});
		response.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		response.send("User created");
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
