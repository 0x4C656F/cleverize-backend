import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRoadmapsController } from "./user-roadmaps.controller";
import { UserRoadmap, UserRoadmapSchema } from "./user-roadmaps.schema";
import { UserRoadmapsService } from "./user-roadmaps.service";

@Module({
	imports: [MongooseModule.forFeature([{ name: UserRoadmap.name, schema: UserRoadmapSchema }])],
	controllers: [UserRoadmapsController],
	providers: [UserRoadmapsService],
	exports: [],
})
export class UserRoadmapsModule {}
