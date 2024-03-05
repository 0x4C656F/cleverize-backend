import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcrypt";
import { Model } from "mongoose";

import { SALT_ROUNDS } from "src/common/constants";

import { User } from "./schema/user.schema";
import { SignUpDto } from "../auth/dto/sign-up.dto";
import { RefreshToken } from "../auth/schema/refresh-token.schema";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async getAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<User> {
		return this.userModel.findById(id).exec();
	}

	async findByEmail(email: string): Promise<User> {
		return this.userModel.findOne({ email }).select("+password").exec();
	}

	async createUser(dto: CreateUserDto): Promise<User> {
		const hashedPassword = await hash(dto.password, SALT_ROUNDS);
		return this.userModel.create({ ...dto, password: hashedPassword });
	}

	async addRefreshToken(userId: string, token: RefreshToken) {
		const user = await this.userModel.findById(userId).exec();
		user.refresh_tokens.push(token);
		return user.save();
	}

	async update(userId: string, body: unknown) {
		return this.userModel.findByIdAndUpdate(userId, {
			$set: body,
		}).exec();
	}
}
