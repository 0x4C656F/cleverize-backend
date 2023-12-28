import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Stripe } from "stripe";

import { User, UserDocument } from "./entity/user.schema";
import getConfig from "../../config/config";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findOrCreate(userData: { data: { user_id: string } }): Promise<User> {
		const user = await this.userModel.findOne({ user_id: userData.data.user_id });

		const stripe = new Stripe(getConfig().stripe);

		if (user) {
			if (user.subscription.stripe_customer_id) {
				return user;
			} else {
				const newCustomer = await stripe.customers.create({});
				user.subscription.stripe_customer_id = newCustomer.id;
				user.markModified("subscription");
				await user.save();
				return user;
			}
		}
		const newCustomer = await stripe.customers.create({});

		const newUser = new this.userModel({
			user_id: userData.data.user_id,
			roadmaps: [],
			credits: 0,
			achievements: [],
		});
		newUser.subscription.stripe_customer_id = newCustomer.id;
		return newUser.save();
	}
}
