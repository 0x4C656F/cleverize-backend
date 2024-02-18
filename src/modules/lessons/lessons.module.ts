import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { LessonController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";
import { Lesson, LessonSchema } from "./schema/lesson.schema";
import { StreamService } from "../../common/stream.service";
import { RoadmapNode, RoadmapNodeSchema } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../user/schema/user.schema";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
		MongooseModule.forFeature([{ name: RoadmapNode.name, schema: RoadmapNodeSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [LessonController],
	providers: [LessonsService, StreamService, SubscriptionsService],
	exports: [],
})
export class LessonModule {}
