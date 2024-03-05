import { Injectable, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare } from "bcrypt";
import { Response } from "express";
import { Model } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { RefreshToken } from "./schema/refresh-token.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>
	) {}
	async registerUser(response: Response, dto: SignUpDto) {
		const [name] = dto.email.split("@");
		console.log("Called with dto", dto, "and name", name);
		const user = await this.usersService.findByEmail(dto.email);
		if (user) {
			throw new ConflictException("User with this email already exists");
		}
		console.log("User was not found, creating user...");
		const newUser = await this.usersService.createUser({ ...dto, name });
		const payload: JWTPayload = {
			email: newUser.email,
			name: newUser.name,
			sub: newUser._id.toString(),
		};
		console.log("Generating tokens");
		const { access_token, refresh_token } = await this.generateTokenPair(payload);

		const reseq = response.cookie("access_token", access_token, {
			sameSite: "none", // 'Strict', 'Lax', or 'None'
			httpOnly: false,
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 3,
		});
		reseq.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			secure: true,

			sameSite: "none", // Necessary if you're making cross-origin requests and your site is served over HTTPS
			maxAge: 1000 * 60 * 60 * 24 * 7, // Adjust according to your refresh token's validity
		});

		reseq.json(newUser);
	}

	async loginUser(response: Response, dto: SignInDto) {
		const { email, password } = dto;
		const user = await this.usersService.findByEmail(email);
		if (!user) throw new ConflictException("Invalid email or password");

		const isValidPassword = await compare(password, user.password);

		if (!isValidPassword) throw new ConflictException("Invalid email or password");

		const payload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		const { access_token, refresh_token } = await this.generateTokenPair(payload);
		response.cookie("access_token", access_token, {
			maxAge: 1000 * 60 * 60 * 24 * 3,
		});
		response.cookie("refresh_token", refresh_token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		return user;
	}

	logout(response: Response) {
		response.clearCookie("access_token");
		response.clearCookie("refresh_token");
		return "Logged out";
	}

	async refreshTokens(response: Response, refresh_token: string) {
		const { sub }: JWTPayload = this.jwtService.verify(refresh_token, {
			secret: process.env.JWT_SECRET,
		});

		const user = await this.usersService.findById(sub);

		if (!user) throw new ConflictException("User not found");

		const newPayload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		const { access_token, refresh_token: new_refresh_token } =
			await this.generateTokenPair(newPayload);

		void this.refreshTokenModel.findOneAndUpdate(
			{ token: refresh_token },
			{
				$set: { isRevoked: true },
			}
		);

		response.cookie("access_token", access_token);
		response.cookie("refresh_token", new_refresh_token, { httpOnly: true });
		return user;
	}

	async generateTokenPair(payload: JWTPayload): Promise<{
		access_token: string;
		refresh_token: string;
	}> {
		const access_token = this.jwtService.sign(payload, {
			expiresIn: "1h",
			secret: process.env.JWT_SECRET,
		});
		const refresh_token = this.jwtService.sign(payload, {
			expiresIn: "7d",
			secret: process.env.JWT_SECRET,
		});
		const createdToken = await this.refreshTokenModel.create({
			token: refresh_token,
			user_id: payload.sub,
			is_revoked: false,
		});
		void this.usersService.addRefreshToken(payload.sub, createdToken.token);
		return { access_token, refresh_token };
	}
}
