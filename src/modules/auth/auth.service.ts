import { Injectable, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare } from "bcrypt";
import { config } from "dotenv";
import { Model } from "mongoose";
import Stripe from "stripe";

import { JwtTokensPair } from "src/common/jwt-tokens-pair";
import { JWTPayload } from "src/common/user-payload.decorator";
import getConfiguration, { Config } from "src/config/configuration";

import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { SignUpDto } from "./dto/sign-up.dto";
import { RefreshToken, RefreshTokenDocument } from "./schema/refresh-token.schema";
import { UsersService } from "../users/users.service";
config();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: "2023-10-16",
});
@Injectable()
export class AuthService {
	private config: Config;
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>
	) {
		this.config = getConfiguration();
	}

	async registerUser(dto: SignUpDto) {
		const user = await this.usersService.findByEmail(dto.email);
		if (user) {
			throw new ConflictException("User with this email already exists");
		}
		const newUser = await this.usersService.createUser(dto);
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

		if (!user.subscription.stripe_customer_id) {
			const customer = await stripe.customers.create();
			await this.usersService.update(user._id.toString(), {
				subscription: { ...user.subscription, stripe_customer_id: customer.id },
			});
		}

		const payload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		await this.usersService.update(user._id.toString(), { last_signed_in: new Date() });

		return this.generateTokenPair(payload);
	}

	async refreshTokens(dto: RefreshTokenDto) {
		const { refresh_token } = dto;
		const { sub }: JWTPayload = this.jwtService.verify(refresh_token, {
			secret: this.config.auth.jwtSecret,
		});

		const user = await this.usersService.findById(sub);

		if (!user) throw new ConflictException("User not found");

		if (!user.subscription.stripe_customer_id) {
			const customer = await stripe.customers.create();
			await this.usersService.update(user._id.toString(), {
				subscription: { ...user.subscription, stripe_customer_id: customer.id },
			});
		}
		const newPayload: JWTPayload = { email: user.email, name: user.name, sub: user._id.toString() };

		void this.refreshTokenModel.findOneAndUpdate(
			{ token: refresh_token },
			{
				$set: { isRevoked: true },
			}
		);

		return this.generateTokenPair(newPayload);
	}

	async generateTokenPair(payload: JWTPayload): Promise<JwtTokensPair> {
		const access_token = this.jwtService.sign(payload, {
			expiresIn: this.config.auth.jwtMaxAge,
			secret: this.config.auth.jwtSecret,
		});
		const refresh_token = this.jwtService.sign(payload, {
			expiresIn: this.config.auth.jwtRefreshMaxAge,
			secret: this.config.auth.jwtSecret,
		});
		const createdRefreshToken: RefreshTokenDocument = await this.refreshTokenModel.create({
			token: refresh_token,
			user_id: payload.sub,
			is_revoked: false,
		});
		await this.usersService.addRefreshToken(payload.sub, createdRefreshToken._id.toString());
		return { _at: access_token, _rt: refresh_token };
	}
}
