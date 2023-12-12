import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from "./entity/user.schema";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
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
