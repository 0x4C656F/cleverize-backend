import { Controller, Post, Body, Get, Param, UseGuards, Patch } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from "axios";
import { Model } from "mongoose";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";
import getConfig from "src/config/config";

import { User, UserDocument } from "./entity/user.schema";
import { UserService } from "./user.service";

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

	@Get("/gettoken")
	async getTokenapi() {
		return await this.userService.getManagementApiToken();
	}
	@UseGuards(AuthGuard("jwt"))
	@Patch("/edit")
	public async updateUser(@Body() body: any, @UserPayload() payload: JWTPayload) {
		const token = await this.userService.getManagementApiToken();
		const options = {
			method: "PATCH",
			url: `${this.auth0Config.domain}api/v2/users/${payload.sub}`,
			headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			data: body,
		};
		const response = await axios(options);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return response.data;
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/")
	async getUser(@UserPayload() payload: JWTPayload): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const token: string = await this.userService.getManagementApiToken();
		const response = await axios({
			method: "GET",
			url: `${this.auth0Config.domain}api/v2/users/${payload.sub}`,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return response.data;
	}
	@UseGuards(AuthGuard("jwt"))
	@Get("/verify/age/:userId")
	async blockUser(@Param("userId") userId: string): Promise<string> {
		const token: string = await this.userService.getManagementApiToken();

		const response = await axios({
			url: `${this.auth0Config.domain}api/v2/users/${userId}`,
			method: "PATCH",
			data: { blocked: true },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return await response.data;
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("/:userId")
	async getUserById(@Param("userId") userId: string): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const token: string = await this.userService.getManagementApiToken();
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
