import { Injectable, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare } from "bcrypt";
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

	async registerUser(dto: SignUpDto) {
		const [name] = dto.email.split("@");
		const user = await this.usersService.findByEmail(dto.email);
		if (user) {
			throw new ConflictException("User with this email already exists");
		}
		const newUser = await this.usersService.createUser({ ...dto, name });
		const payload: JWTPayload = {
			email: newUser.email,
			name: newUser.name,
			sub: newUser._id.toString(),
		};
		return this.generateTokenPair(payload);
	}

	async loginUser(dto: SignInDto) {
		const { email, password } = dto;
		const user = await this.usersService.findByEmail(email);
		if (!user) throw new ConflictException("Invalid email or password");

		const isValidPassword = await compare(password, user.password);

		if (!isValidPassword) throw new ConflictException("Invalid email or password");

		const payload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		return this.generateTokenPair(payload);
	}

	async refreshTokens(refresh_token: string) {
		const { sub }: JWTPayload = this.jwtService.verify(refresh_token, {
			secret: process.env.JWT_SECRET,
		});

		const user = await this.usersService.findById(sub);

		if (!user) throw new ConflictException("User not found");

		const newPayload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		void this.refreshTokenModel.findOneAndUpdate(
			{ token: refresh_token },
			{
				$set: { isRevoked: true },
			}
		);

		return this.generateTokenPair(newPayload);
	}

	async generateTokenPair(payload: JWTPayload): Promise<{
		_at: string;
		_rt: string;
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
		return { _at: access_token, _rt: refresh_token };
	}
}
