import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcrypt";
import { Model } from "mongoose";

import { SALT_ROUNDS } from "src/common/constants";

import { User } from "./schema/user.schema";
import { SignInDto } from "../auth/dto/sign-in.dto";

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<User> {
		return this.userModel.findById(id).exec();
	}

	async findByEmail(email: string): Promise<User> {
		return this.userModel.findOne({ email }).exec();
	}

	async createUser(dto: SignInDto): Promise<User> {
		dto.password = await hash(dto.password, SALT_ROUNDS);
		return new this.userModel(dto).save();
	}
}
