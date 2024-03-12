import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { StreamService } from "src/common/stream.service";

import { RoadmapTemplatesController } from "./roadmap-templates.controller";
import { TemplateRoadmapNode, TemplateRoadmapNodeSchema } from "./roadmap-templates.schema";
import { RoadmapTemplatesService } from "./roadmap-templates.service";
import { LessonsService } from "../lessons/lessons.service";
import { Lesson, LessonSchema } from "../lessons/schema/lesson.schema";
import { QuizzesService } from "../quizzes/quizzes.service";
import { Quiz, QuizSchema } from "../quizzes/schema/quiz.schema";
import { RoadmapNodesService } from "../roadmap-nodes/roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeSchema } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: TemplateRoadmapNode.name, schema: TemplateRoadmapNodeSchema },
			{ name: RoadmapNode.name, schema: RoadmapNodeSchema },
			{ name: Lesson.name, schema: LessonSchema },
			{ name: User.name, schema: UserSchema },
			{ name: Quiz.name, schema: QuizSchema },
		]),
	],
	controllers: [RoadmapTemplatesController],
	providers: [
		RoadmapTemplatesService,
		RoadmapNodesService,
		SubscriptionsService,
		UsersService,
		LessonsService,
		QuizzesService,
		StreamService,
	],
	exports: [RoadmapTemplatesService],
})
export class RoadmapTemplatesModule {}
