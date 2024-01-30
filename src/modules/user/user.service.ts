import { HttpException, Injectable, RawBodyRequest } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Stripe } from "stripe";
import { Webhook, WebhookRequiredHeaders } from "svix";

import { User, UserDocument } from "./entity/user.schema";
import getConfig from "../../config/config";

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findOrCreate(request: RawBodyRequest<Request>): Promise<User> {
		const config = getConfig();
		const stripe = new Stripe(config.stripe);
		const webhookSecret = config.clerk.sessionCreateWhsec;
		const wh = new Webhook(webhookSecret);
		const payload = request.rawBody.toString("utf8");
		const headers = request.headers;
		let message: { data: { user_id: string } };
		try {
			message = wh.verify(payload, headers as unknown as WebhookRequiredHeaders) as {
				data: { user_id: string };
			};
			const user = await this.userModel.findOne({ user_id: message.data.user_id });

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
				user_id: newCustomer.id,
				roadmaps: [],
				achievements: [],
			});
			newUser.subscription.stripe_customer_id = newCustomer.id;
			return newUser.save();
		} catch {
			throw new HttpException("Invalid webhook signature", 400);
		}
	}
}
