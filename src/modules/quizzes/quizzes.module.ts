import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { QuizzesController } from "./quizzes.controller";
import { QuizzesService } from "./quizzes.service";
import { Quiz, QuizSchema } from "./schema/quiz.schema";
import { StreamService } from "../../common/stream.service";
import { RoadmapNode, RoadmapNodeSchema } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserSchema } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
		MongooseModule.forFeature([{ name: RoadmapNode.name, schema: RoadmapNodeSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [QuizzesController],
	providers: [QuizzesService, StreamService, SubscriptionsService, UsersService],
})
export class QuizzesModule {}
