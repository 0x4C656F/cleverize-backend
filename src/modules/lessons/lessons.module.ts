import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { LessonController } from "./lessons.controller";
import { LessonsService } from "./lessons.service";
import { Lesson, LessonSchema } from "./schema/lesson.schema";
import { StreamService } from "../../common/stream.service";
import { RoadmapNodesService } from "../roadmap-nodes/roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeSchema } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
		MongooseModule.forFeature([{ name: RoadmapNode.name, schema: RoadmapNodeSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [LessonController],
	providers: [
		LessonsService,
		UsersService,
		StreamService,
		SubscriptionsService,
		RoadmapNodesService,
	],
	exports: [],
})
export class LessonModule {}
