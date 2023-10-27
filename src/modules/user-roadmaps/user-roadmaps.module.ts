import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRoadmapsController } from "./user-roadmaps.controller";
import { UserRoadmap, UserRoadmapSchema } from "./user-roadmaps.schema";

@Module({
	imports: [MongooseModule.forFeature([{ name: UserRoadmap.name, schema: UserRoadmapSchema }])],
	controllers: [UserRoadmapsController],
	providers: [],
	exports: [],
})
export class UserRoadmapsModule {}
