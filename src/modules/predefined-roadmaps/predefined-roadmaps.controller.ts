import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { PredefinedRoadmapsService } from "./predefined-roadmaps.service";

@ApiTags("Predefined roadmaps")
@Controller("/roadmaps")
export class PredefinedRoadmapsController {
	constructor(private readonly service: PredefinedRoadmapsService) {}
}
