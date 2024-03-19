import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Subscription } from "./subscription";
import { User, UserDocument } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class SubscriptionsService {
	constructor(private userService: UsersService) {}

	// public async activateTrial(id: string) {
	// 	const user = await this.userModel.findOne({ user_id: id });
	// 	if (!user) throw new NotFoundException();
	// 	if (user.subscription.is_trial_activated) {
	// 		console.log("trial not activated");

	// 		throw new ConflictException("trial was already activated");
	// 	}

	// 	user.subscription.is_trial_activated = true;
	// 	console.log("trial activated");

	// 	user.subscription.credits = TRIAL_CREDITS;
	// 	user.subscription.last_credits_update = new Date();

	// 	user.markModified("subscription");

	// 	return await user.save();
	// }

	public async getSubscriptionData(id: string): Promise<Subscription> {
		const user = await this.userService.findById(id);
		return user.subscription;
	}

	public async topUpCredits(id: string, credits: number) {
		const user = await this.userService.findOne({ "subscription.stripe_customer_id": id });
		if (!user) throw new NotFoundException();

		user.subscription.credits += Number(credits);
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}

	public async deductCredits(id: string, credits: number) {
		const user = await this.userService.findById(id);
		if (!user) throw new NotFoundException();

		user.subscription.credits -= credits;
		user.subscription.last_credits_update = new Date();

		user.markModified("subscription");

		return await user.save();
	}
}
