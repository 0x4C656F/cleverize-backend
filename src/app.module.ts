import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import config from "./config/config";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { LessonModule } from "./modules/lessons/lessons.module";
import { QuizzesModule } from "./modules/quizzes/quizzes.module";
import { RoadmapNodesModule } from "./modules/roadmap-nodes/roadmap-nodes.module";
import { RoadmapTemplatesModule } from "./modules/roadmap-templates/roadmap-templates.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [config],
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI),
		AuthorizationModule,
		UserModule,
		LessonModule,
		RoadmapNodesModule,
		SubscriptionsModule,
		FeedbackModule,
		RoadmapTemplatesModule,
		QuizzesModule,
	],
	controllers: [AppController],
	providers: [AppService],
	exports: [],
})
export class AppModule {}
