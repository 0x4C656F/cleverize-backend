/* eslint-disable @typescript-eslint/require-await */
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshToken, RefreshTokenSchema } from "./schema/refresh-token.schema";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	controllers: [AuthController],
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
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
