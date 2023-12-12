import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { Model } from "mongoose";

import { User, UserDocument } from "./entity/user.schema";
import getConfig from "../../config/config";
type Auth0Token = {
	access_token: string;
	type: string;
	expires_at: string;
};
@Injectable()
export class UserService {
	private readonly auth0Config: {
		audience: string;
		domain: string;
		clientId: string;
		clientSecret: string;
	};
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.auth0Config = getConfig().auth0;
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}
	async getManagementApiToken(): Promise<string> {
		const options = {
			method: "POST",
			url: `${this.auth0Config.domain}oauth/token`,
			headers: { "content-type": "application/x-www-form-urlencoded" },
			data: new URLSearchParams({
				grant_type: "client_credentials",
				client_id: this.auth0Config.clientId,
				client_secret: this.auth0Config.clientSecret,
				audience: `${this.auth0Config.domain}api/v2/`,
			}),
		};
		const axiosResponse = await axios(options);
		const data: Auth0Token = (await axiosResponse.data) as Auth0Token;
		const token: string = data.access_token;
		return token;
	}
	async findOrCreate(userData: { data: { user_id: string } }): Promise<User> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const user = await this.userModel.findOne({ user_id: userData.data.user_id });
		if (user) {
			return user;
		}
		const newUser = new this.userModel({
			user_id: userData.data.user_id,
			roadmaps: [],
			achievements: [],
		});
		return newUser.save();
	}
}
