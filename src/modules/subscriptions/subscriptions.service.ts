import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Subscription, TRIAL_CREDITS } from "./subscription";
import { User, UserDocument } from "../user/entity/user.schema";

@Injectable()
export class SubscriptionsService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	public async activateTrial(id: string) {
		const user = await this.userModel.findOne({ user_id: id });
		if (!user) throw new NotFoundException();

		if (user.subscription.is_trial_activated)
			throw new ConflictException("trial is already activated");

		user.subscription.is_trial_activated = true;
		user.subscription.credits = TRIAL_CREDITS;
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}

	public async getSubscriptionData(id: string): Promise<Subscription> {
		const user = await this.userModel.findOne({ user_id: id });
		return user.subscription;
	}

	public async topUpCredits(id: string, credits: number) {
		const user = await this.userModel.findOne({ "subscription.stripe_customer_id": id });
		if (!user) throw new NotFoundException();

		user.subscription.credits += Number(credits);
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}
}
