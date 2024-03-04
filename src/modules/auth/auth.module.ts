import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshToken, RefreshTokenSchema } from "./schema/refresh-token.schema";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	controllers: [AuthController],
	providers: [AuthService, UsersService, JwtService],
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
		]),
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			global: true,
		}),
	],
})
export class AuthModule {}
