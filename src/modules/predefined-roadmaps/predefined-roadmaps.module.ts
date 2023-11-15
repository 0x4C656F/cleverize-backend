import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { PredefinedRoadmapsController } from "./predefined-roadmaps.controller";
import { PredefinedRoadmapsService } from "./predefined-roadmaps.service";

@Module({
	imports: [MongooseModule.forFeature([])],
	controllers: [PredefinedRoadmapsController],
	providers: [PredefinedRoadmapsService],
	exports: [],
})
export class PredefinedRoadmapsModule {}
