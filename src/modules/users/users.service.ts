import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { config } from "dotenv";
import { Model } from "mongoose";
import Stripe from "stripe";

import { SALT_ROUNDS } from "src/common/constants";

import { CreateUserDto } from "./dto/create-user.dto";
import { User, UserDocument } from "./schema/user.schema";
import { subscriptionDefaultObject } from "../subscriptions/subscription";
config();
const stripe = new Stripe(process.env.STRIPE_SECRET, {
	apiVersion: "2023-10-16",
});

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async getAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findById(id: string): Promise<UserDocument> {
		const user = await this.userModel.findById(id);
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	async findByEmail(email: string): Promise<UserDocument> {
		return this.userModel.findOne({ email }).select("+password");
	}

	async createUser(dto: CreateUserDto): Promise<UserDocument> {
		const { password, email } = dto;
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
		const [name] = email.split("@");

		const customer = await stripe.customers.create({ email: email, name: name });

		return this.userModel.create({
			email,
			password: hashedPassword,
			name,
			subscription: { ...subscriptionDefaultObject, stripe_customer_id: customer.id },
		});
	}

	async addRefreshToken(userId: string, token: string): Promise<UserDocument> {
		const user = await this.userModel.findById(userId);
		user.refresh_tokens.push(token);
		await user.save();
		return user;
	}
	async findOne(query: unknown): Promise<UserDocument> {
		return this.userModel.findOne(query).exec();
	}
	async findByCustomerId(stripe_customer_id: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({
			"subscription.stripe_customer_id": stripe_customer_id,
		});
		if (!user) throw new NotFoundException("No user with customer id: " + stripe_customer_id);
		return user;
	}

	async update(userId: string, body: unknown) {
		return this.userModel
			.findByIdAndUpdate(userId, {
				$set: body,
			})
			.exec();
	}
}
