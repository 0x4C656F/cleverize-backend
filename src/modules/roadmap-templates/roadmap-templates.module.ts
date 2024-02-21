import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RoadmapTemplatesController } from "./roadmap-templates.controller";
import { TemplateRoadmapNode, TemplateRoadmapNodeSchema } from "./roadmap-templates.schema";
import { RoadmapTemplatesService } from "./roadmap-templates.service";
import { Lesson, LessonSchema } from "../lessons/schema/lesson.schema";
import { Quiz, QuizSchema } from "../quizzes/schema/quiz.schema";
import { RoadmapNode, RoadmapNodeSchema } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { User, UserSchema } from "../user/schema/user.schema";

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
	providers: [RoadmapTemplatesService],
	exports: [],
})
export class RoadmapTemplatesModule {}
