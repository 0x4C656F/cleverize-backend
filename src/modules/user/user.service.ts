import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./entity/user.schema";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findOrCreate(userData: any): Promise<User> {
		const user = await this.userModel.findOne({ user_id: userData.user_id });
		if (user) {
			return user;
		}
		const newUser = new this.userModel(userData);
		return newUser.save();
	}
}
