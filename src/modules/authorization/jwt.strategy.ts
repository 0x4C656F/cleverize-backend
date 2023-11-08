/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

import getConfig from "src/config/config";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		let auth0Config = getConfig().auth0;
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
		console.log(payload);
		return payload;
	}
}
