import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";

import { SUPPORTED_LANGUAGES } from "src/common/constants";
import { JwtTokensPair } from "src/common/jwt-tokens-pair";
import { JWTPayload } from "src/common/user-payload.decorator";

import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { DEFAULT_CREDITS } from "../subscriptions/subscription";
import { User } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

describe("AuthService", () => {
	let authService: AuthService;
	let usersService: UsersService;
	let jwtService: JwtService;
	// let model: Model<RefreshToken>;

	const mockService = {
		generateTokenPair: jest.fn(),
	};

	const mockRefreshTokenModel = {
		create: jest.fn(),
	};

	const dto: SignUpDto = { email: "test@test.com", password: "password" };
	const mockUser: User = {
		email: dto.email,
		name: dto.email.split("@")[0],
		_id: "id" as unknown as Types.ObjectId,
		password: dto.password,
		refresh_tokens: [],
		roadmaps: [],
		last_signed_in: new Date(),
		metadata: {
			language: SUPPORTED_LANGUAGES.ENGLISH,
		},
		subscription: {
			is_trial_activated: false,
			credits: DEFAULT_CREDITS,
			subscription_type: undefined,
			last_credits_update: new Date(),
			stripe_customer_id: undefined,
		},
	};
	const mockPayload: JWTPayload = {
		email: dto.email,
		name: dto.email.split("@")[0],
		sub: mockUser._id.toString(),
	};
	const mockTokens: JwtTokensPair = {
		_at: "access",
		_rt: "refresh",
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
						addRefreshToken: jest.fn(),
					},
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn(),
					},
				},
				{
					provide: getModelToken("User"),
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
		// model = module.get<Model<RefreshToken>>(getModelToken(RefreshToken.name));
	});
	describe("sign-up", () => {
		it("should create user and return pair of tokens typeof JwtTokensPair", async () => {
			// eslint-disable-next-line unicorn/no-null
			jest.spyOn(usersService, "findByEmail").mockReturnValue(null);
			jest.spyOn(usersService, "createUser").mockResolvedValue(mockUser);
			jest.spyOn(authService, "generateTokenPair").mockReturnValue(Promise.resolve(mockTokens));

			const result = await authService.registerUser(dto);

			expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
			expect(usersService.createUser).toHaveBeenCalledWith(dto);
			expect(authService.generateTokenPair).toHaveBeenCalledWith(mockPayload);

			expect(result).toEqual(mockTokens);
		});

		it("should throw error if user with given email already exists", async () => {
			jest.spyOn(usersService, "findByEmail").mockResolvedValue(mockUser);

			await expect(authService.registerUser(dto)).rejects.toThrowError(
				"User with this email already exists"
			);
		});
	});

	describe("generateTokenPair", () => {
		it("should return pair of tokens", async () => {
			jest
				.spyOn(jwtService, "sign")
				.mockReturnValueOnce(mockTokens._at)
				.mockReturnValueOnce(mockTokens._rt);

			jest.spyOn(usersService, "addRefreshToken").mockResolvedValue(Promise.resolve(mockUser));
			const result = await authService.generateTokenPair(mockPayload);

			expect(result).toEqual(mockTokens);
			expect(usersService.addRefreshToken).toHaveBeenCalledWith(mockUser._id, mockTokens._rt);
			expect(jwtService.sign).toHaveBeenCalledTimes(2);
		});
	});
});
