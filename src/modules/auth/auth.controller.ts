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
	async signUp(@Res() response: Response, @Body() dto: SignUpDto, @Cookies() token: string) {
		console.log("Received cookies", token);
		const { access_token, refresh_token } = await this.authService.registerUser(response, dto);
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader(
			"Access-Control-Allow-Origin",
			"https://vercel.live/link/cleverize-git-auth-rework-lavryniukk.vercel.app?via=deployment-domains-list-branch"
		);

		response.cookie("access_token", access_token, {
			maxAge: 1000 * 60 * 60,
			sameSite: "none",
			secure: true,
		});

		response.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			sameSite: "none",
			secure: true,
		});

		response.status(200).send("OK");
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
