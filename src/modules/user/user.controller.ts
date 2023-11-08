import { Controller, Post, Body, Get, Param, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from "axios";
import { Model } from "mongoose";

import getConfig from "src/config/config";

import { User, UserDocument } from "./entity/user.schema";
import { UserService } from "./user.service";

// Define the type outside of the class to avoid ESLint errors
type Auth0Token = {
	access_token: string;
	token_type: string;
	expires_in: number;
};

@Controller("/users")
export class UserController {
	private readonly auth0Config: {
		audience: string;
		domain: string;
		clientId: string;
		clientSecret: string;
	};

	constructor(
		private readonly userService: UserService,
		@InjectModel(User.name) private readonly model: Model<UserDocument>
	) {
		this.auth0Config = getConfig().auth0;
	}

	@Post()
	async upsertUser(@Body() userData: unknown): Promise<any> {
		return this.userService.findOrCreate(userData);
	}

	@Get("/all")
	async findAll(): Promise<any> {
		return this.userService.findAll();
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		const options = {
			method: "POST",
			url: `${this.auth0Config.domain}oauth/token`,
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "client_credentials",
				client_id: this.auth0Config.clientId,
				client_secret: this.auth0Config.clientSecret,
				audience: this.auth0Config.audience,
			}),
		};
		const axiosResponse = await axios(options);
		const data: Auth0Token = axiosResponse.data as Auth0Token;
		const token: string = data.access_token;
		const response = await axios({
			method: "GET",
			url: `${this.auth0Config.domain}api/v2/users/${userId}`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return response.data;
	}
}
