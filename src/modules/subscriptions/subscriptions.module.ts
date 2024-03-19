import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	controllers: [SubscriptionsController],
	providers: [SubscriptionsService, UsersService],
	exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
