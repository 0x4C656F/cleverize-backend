import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("sign-up")
	async signUp(@Body() dto: SignUpDto) {
		return this.authService.registerUser(dto);
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
