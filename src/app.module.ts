import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import configuration from "./config/configuration";
import { AuthModule } from "./modules/auth/auth.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { LessonModule } from "./modules/lessons/lessons.module";
import { QuizzesModule } from "./modules/quizzes/quizzes.module";
import { RoadmapNodesModule } from "./modules/roadmap-nodes/roadmap-nodes.module";
import { RoadmapTemplatesModule } from "./modules/roadmap-templates/roadmap-templates.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UserSchema } from "./modules/users/schema/user.schema";
import { UsersModule } from "./modules/users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configuration],
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI),
		MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
		LessonModule,
		UsersModule,
		RoadmapNodesModule,
		SubscriptionsModule,
		FeedbackModule,
		RoadmapTemplatesModule,
		QuizzesModule,
		AuthModule,
	],
	controllers: [AppController],
})
export class AppModule {}
