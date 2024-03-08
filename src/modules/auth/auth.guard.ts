import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { JWTPayload } from "src/common/user-payload.decorator";
import getConfiguration, { Config } from "src/config/configuration";

@Injectable()
export class AuthGuard implements CanActivate {
	private config: Config;
	constructor(private jwtService: JwtService) {
		this.config = getConfiguration();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload: JWTPayload = await this.jwtService.verifyAsync(token, {
				secret: this.config.auth.jwtSecret,
				ignoreExpiration: false,
			});

			request["user"] = payload;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
