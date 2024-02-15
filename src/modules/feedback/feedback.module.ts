// feedback.module.ts

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { FeedbackController } from "./feedback.controller";
import { Feedback, FeedbackSchema } from "./schema/feedback.schema";

@Module({
	controllers: [FeedbackController],
	imports: [MongooseModule.forFeature([{ name: Feedback.name, schema: FeedbackSchema }])],
})
export class FeedbackModule {}
