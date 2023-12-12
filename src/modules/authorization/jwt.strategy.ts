import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

import getConfig from "src/config/config";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService) {
		super({
			secretOrKeyProvider: passportJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `${getConfig().clerk.issuerUrl}/.well-known/jwks.json`,
			}),

			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			issuer: `${getConfig().clerk.issuerUrl}`,
			algorithms: ["RS256"],
		});
	}

	validate(payload: unknown): unknown {
		return payload;
	}
}
