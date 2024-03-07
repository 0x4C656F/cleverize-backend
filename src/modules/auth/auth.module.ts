/* eslint-disable @typescript-eslint/require-await */
import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

import getConfiguration from "src/config/configuration";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshToken, RefreshTokenSchema } from "./schema/refresh-token.schema";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";
const config = getConfiguration();
@Module({
	controllers: [AuthController],
	imports: [
		JwtModule.register({
			secret: config.jwtSecret,
			global: true,
		}),
		MongooseModule.forFeature([
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
	],
	providers: [AuthService, JwtService, UsersService],
})
export class AuthModule {}
