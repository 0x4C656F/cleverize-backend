import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { Model, Types } from "mongoose";

import { JWTPayload } from "src/common/user-payload.decorator";

import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { RefreshToken } from "./schema/refresh-token.schema";
import { DEFAULT_CREDITS } from "../subscriptions/subscription";
import { User } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
	let authService: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;
	let model: Model<RefreshToken>;
	
	const mockService = {
		generateTokenPair: jest.fn(),
	};

	const mockRefreshTokenModel = {
		create: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						findByEmail: jest.fn(),
						createUser: jest.fn(),
						generateTokenPair: jest.fn(),
					},
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn(),
					},
				},
				{
					provide: getModelToken('User'),
					useValue: mockService,
				},
				{
					provide: getModelToken("RefreshToken"),
					useValue: mockRefreshTokenModel,
				},
			],
		}).compile();
		authService = module.get<AuthService>(AuthService);
		usersService = module.get<UsersService>(UsersService);
		jwtService = module.get<JwtService>(JwtService);
		model = module.get<Model<RefreshToken>>(getModelToken(RefreshToken.name));
	});
	describe("sign-up", () => {
		const dto: SignUpDto = { email: "test@test.com", name: "me", password: "password" };
		const mockUser: User = {
			email: dto.email,
			name: dto.name,
			_id: "id" as unknown as Types.ObjectId,
			password: dto.password,
			refresh_tokens: [],
			roadmaps: [],
			subscription: {
				is_trial_activated: false,
				credits: DEFAULT_CREDITS,
				subscription_type: undefined,
				last_credits_update: new Date(),
				stripe_customer_id: undefined,
			},
		};
		const mockResponse: Response = {
			cookie: jest.fn(),
		} as unknown as Response;
		it('should return user and set cookies with "access_token" and "refresh_token"', async () => {
			const mockPayload: JWTPayload = {
				email: dto.email,
				name: dto.name,
				sub: "id",
			};

			// eslint-disable-next-line unicorn/no-null
			jest.spyOn(usersService, "findByEmail").mockReturnValue(null);
			jest.spyOn(usersService, "createUser").mockResolvedValue(mockUser);
			jest
				.spyOn(authService, "generateTokenPair")
				.mockReturnValue(Promise.resolve({ access_token: "token", refresh_token: "token" }));

			const result = await authService.registerUser(mockResponse, dto);

			expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
			expect(usersService.createUser).toHaveBeenCalledWith(dto);
			expect(authService.generateTokenPair).toHaveBeenCalledWith(mockPayload);
			expect(mockResponse.cookie).toHaveBeenCalledWith("access_token", "token", { httpOnly: true });
			expect(mockResponse.cookie).toHaveBeenCalledWith("refresh_token", "token", {
				httpOnly: true,
			});
			expect(result).toEqual(mockUser);
		});

		it("should throw error if user with given email already exists", async () => {
			jest.spyOn(usersService, "findByEmail").mockResolvedValue(mockUser);

			await expect(authService.registerUser(mockResponse, dto)).rejects.toThrowError(
				"User with this email already exists"
			);
		});
	});

	describe("generateTokenPair", () => {
		const mockPayload: JWTPayload = {
			sub: "idk3292jd2j",
			email: "me@mail.com",
			name: "lev",
		};
		const generatedPair = {
			access_token: "access",
			refresh_token: "refresh",
		};

		it("should return pair of tokens", async () => {
			jest
				.spyOn(jwtService, "sign")
				.mockReturnValueOnce(generatedPair.access_token)
				.mockReturnValueOnce(generatedPair.refresh_token);

			const result = await authService.generateTokenPair(mockPayload);

			expect(result).toEqual(generatedPair);

			expect(model.create).toHaveBeenCalledWith({
				token: generatedPair.refresh_token,
				user_id: mockPayload.sub,
				is_revoked: false,
			});
			expect(jwtService.sign).toHaveBeenCalledTimes(2);
		});
	});

	
});
