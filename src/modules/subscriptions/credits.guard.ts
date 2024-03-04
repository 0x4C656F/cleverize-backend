import { CanActivate, ExecutionContext, mixin } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { getUserPayload } from "src/common/user-payload.decorator";

import { User, UserDocument } from "../users/schema/user.schema";

export const CreditsGuard = (expectedCredits: number) => {
	class CreditsGuardMixin implements CanActivate {
		constructor(@InjectModel(User.name) public readonly userModel: Model<UserDocument>) {}

		public async canActivate(context: ExecutionContext) {
			const id = getUserPayload(context).sub;
			const user = await this.userModel.findById(id);

			return !!(user && user.subscription.credits >= expectedCredits);
		}
	}

	return mixin(CreditsGuardMixin);
};
