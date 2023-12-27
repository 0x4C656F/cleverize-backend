import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import config from "./config/config";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UserModule } from "./modules/user/user.module";
import { UserRoadmapNodesModule } from "./modules/user-roadmap-nodes/user-roadmap-nodes.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [config],
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI),
		AuthorizationModule,
		UserModule,
		ConversationsModule,
		UserRoadmapNodesModule,
		SubscriptionsModule,
	],
	controllers: [AppController],
	providers: [AppService],
	exports: [],
})
export class AppModule {}
