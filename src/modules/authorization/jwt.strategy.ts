import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

import { Auth0Config } from "src/config/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		const auth0Config = configService.get<Auth0Config>("auth0");

		super({
			secretOrKeyProvider: passportJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `${auth0Config.domain}.well-known/jwks.json`,
			}),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			audience: auth0Config.audience,
			issuer: auth0Config.domain,
			algorithms: ["RS256"],
		});
	}

	validate(payload: unknown): unknown {
		return payload;
	}
}
