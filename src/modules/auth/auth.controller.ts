import { Body, Controller, Header, Logger, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { Cookies } from "src/common/cookies.decorator";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Header("Access-Control-Allow-Credentials", "true")
	@Header(
		"Access-Control-Allow-Origin",
		"https://vercel.live/link/cleverize-git-auth-rework-lavryniukk.vercel.app?via=deployment-domains-list-branch"
	)
	@Post("sign-up")
	signUp(@Res() response: Response, @Body() dto: SignUpDto, @Cookies() token: string) {
		Logger.log("Received cookies", token);
		response.status(200).send(this.authService.registerUser(response, dto));
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
