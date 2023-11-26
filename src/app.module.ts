import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import config from "./config/config";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PredefinedRoadmapsModule } from "./modules/predefined-roadmaps/predefined-roadmaps.module";
import { UserModule } from "./modules/user/user.module";
import { UserRoadmapsModule } from "./modules/user-roadmaps/user-roadmaps.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [config],
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI),
		AuthorizationModule,
		UserModule,
		UserRoadmapsModule,
		ConversationsModule,
		PredefinedRoadmapsModule,
		// PaymentsModule,
	],
	controllers: [AppController],
	providers: [AppService],
	exports: [],
})
export class AppModule {}
