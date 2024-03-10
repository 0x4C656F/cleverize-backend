import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { StreamService } from "src/common/stream.service";

import { RoadmapNodesController } from "./roadmap-nodes.controller";
import { RoadmapNodesService } from "./roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeSchema } from "./schema/roadmap-nodes.schema";
import { LessonModule } from "../lessons/lessons.module";
import { QuizzesModule } from "../quizzes/quizzes.module";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: RoadmapNode.name, schema: RoadmapNodeSchema },
			{ name: User.name, schema: UserSchema },
		]),
		QuizzesModule,
		LessonModule,
	],
	controllers: [RoadmapNodesController],
	providers: [RoadmapNodesService, SubscriptionsService, StreamService, UsersService],
	exports: [RoadmapNodesService],
})
export class RoadmapNodesModule {}
