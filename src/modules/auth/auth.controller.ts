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
		response.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
		// response.cookie("access_token", access_token, {
		// 	maxAge: 1000 * 60 * 60,
		// 	sameSite: "none",
		// 	secure: true,
		// });
		const maxAge = 3600; // Max-Age in seconds
		const expires = new Date(Date.now() + maxAge * 1000).toUTCString(); // Convert Max-Age to Expires date

		response.setHeader(
			"Set-Cookie",
			`access_token=${access_token}; Max-Age=${maxAge}; Path=/; Expires=${expires}; Secure; SameSite=None`
		);
		const maxAge1 = 3600; // Max-Age in seconds
		const expires1 = new Date(Date.now() + maxAge * 1000).toUTCString(); // Convert Max-Age to Expires date

		response.setHeader(
			"Set-Cookie",
			`refresh_token=${refresh_token}; Max-Age=${maxAge}; Path=/; Expires=${expires}; Secure; SameSite=None`
		);
		// response.cookie("refresh_token", refresh_token, {
		// 	httpOnly: true,
		// 	maxAge: 1000 * 60 * 60 * 24 * 7,
		// 	sameSite: "none",
		// 	secure: true,
		// });

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
