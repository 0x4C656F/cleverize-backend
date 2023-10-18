import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [PassportModule.register({ defaultStrategy: "jwt" })],
	controllers: [],
	providers: [JwtStrategy],
	exports: [PassportModule],
})
export class AuthorizationModule {}
