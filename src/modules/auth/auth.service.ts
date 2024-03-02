import { Injectable, Dependencies, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare } from "bcrypt";
import { Response } from "express";
import { Model } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { RefreshToken } from "./schema/refresh-token.schema";
import { UsersService } from "../users/users.service";

@Injectable()
@Dependencies(UsersService)
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>
	) {}
	async registerUser(response: Response, dto: RegisterUserDto) {
		const { email, password, name } = dto;
		const user = await this.usersService.findByEmail(email);
		if (user) {
			throw new ConflictException("User already exists");
		}
		const newUser = await this.usersService.createUser({ email, password, name });
		const payload = { email: newUser.email, name: newUser.name, sub: newUser._id };
		const access_token = this.jwtService.sign(payload);
		const refresh_token = this.jwtService.sign(payload, { expiresIn: "7d" });
		response.cookie("access_token", access_token, { httpOnly: true });
		response.cookie("refresh_token", refresh_token, { httpOnly: true });
		return newUser;
	}

	async loginUser(response: Response, dto: LoginUserDto) {
		const { email, password } = dto;
		const user = await this.usersService.findByEmail(email);
		if (!user || !(await compare(password, user.password)))
			throw new ConflictException("Invalid email or password");

		const payload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		const { access_token, refresh_token } = this.generatePairOfTokens(payload);
		response.cookie("access_token", access_token, { httpOnly: true });
		response.cookie("refresh_token", refresh_token, { httpOnly: true });
		return user;
	}

	logout(response: Response) {
		response.clearCookie("access_token");
		response.clearCookie("refresh_token");
		return "Logged out";
	}

	async refreshTokens(response: Response, refresh_token: string) {
		const { sub }: JWTPayload = this.jwtService.verify(refresh_token);

		const user = await this.usersService.findById(sub);

		if (!user) throw new ConflictException("User not found");

		const newPayload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		const { access_token, refresh_token: new_refresh_token } =
			this.generatePairOfTokens(newPayload);

		void this.refreshTokenModel.findOneAndUpdate(
			{ token: refresh_token },
			{
				$set: { isRevoked: true },
			}
		);

		response.cookie("access_token", access_token, { httpOnly: true });
		response.cookie("refresh_token", new_refresh_token, { httpOnly: true });
		return user;
	}

	private generatePairOfTokens(payload: JWTPayload) {
		const access_token = this.jwtService.sign(payload);
		const refresh_token = this.jwtService.sign(payload, { expiresIn: "7d" });
		void this.refreshTokenModel.create({ token: refresh_token, user_id: payload.sub });
		return { access_token, refresh_token };
	}
}
