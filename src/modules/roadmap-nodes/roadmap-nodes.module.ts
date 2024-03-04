import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RoadmapNodesController } from "./roadmap-nodes.controller";
import { RoadmapNodesService } from "./roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeSchema } from "./schema/roadmap-nodes.schema";
import { Lesson, LessonSchema } from "../lessons/schema/lesson.schema";
import { Quiz, QuizSchema } from "../quizzes/schema/quiz.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: RoadmapNode.name, schema: RoadmapNodeSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Lesson.name, schema: LessonSchema },
			{ name: Quiz.name, schema: QuizSchema },
		]),
	],
	controllers: [RoadmapNodesController],
	providers: [RoadmapNodesService, SubscriptionsService],
	exports: [],
})
export class RoadmapNodesModule {}
