import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { JwtTokensPair } from "src/common/jwt-tokens-pair";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("sign-up")
	signUp(@Body() dto: SignUpDto): Promise<JwtTokensPair> {
		console.log("sign up", dto);
		return this.authService.registerUser(dto);
	}

	@Post("sign-in")
	signIn(@Body() dto: SignInDto): Promise<JwtTokensPair> {
		console.log("sign in", dto);
		return this.authService.loginUser(dto);
	}

	@Post("refresh-token")
	refresh(@Body() dto: RefreshTokenDto): Promise<JwtTokensPair> {
		console.log("refresh token", dto);
		return this.authService.refreshTokens(dto);
	}

	@UseGuards(AuthGuard)
	@Get()
	getHello(): boolean {
		return true;
	}
}
