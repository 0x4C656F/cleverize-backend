import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { User, UserSchema } from "../user/schema/user.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	controllers: [SubscriptionsController],
	providers: [SubscriptionsService],
	exports: [],
})
export class SubscriptionsModule {}
