import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema } from "src/modules/user/entity/user.schema";

import { PredefinedRoadmapsController } from "./predefined-roadmaps.controller";
import { PredefinedRoadmapsService } from "./predefined-roadmaps.service";
import { PredefinedRoadmap, PredefinedRoadmapSchema } from "./schemas/predefined-roadmap.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: PredefinedRoadmap.name, schema: PredefinedRoadmapSchema },
			{ name: User.name, schema: UserSchema },
		]),
	],
	controllers: [PredefinedRoadmapsController],
	providers: [PredefinedRoadmapsService],
	exports: [],
})
export class PredefinedRoadmapsModule {}
