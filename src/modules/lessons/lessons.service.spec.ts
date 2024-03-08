import { getModelToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { Model } from "mongoose";
import OpenAI from "openai";

import { StreamService } from "src/common/stream.service";
import getConfiguration, { Config } from "src/config/configuration";

import { LessonsService } from "./lessons.service";
import { LessonDocument, Lesson } from "./schema/lesson.schema";
import { RoadmapNodeDocument, RoadmapNode } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

describe("LessonsService", () => {
	let service: LessonsService;
	let model: Model<LessonDocument>;
	let roadmapModel: Model<RoadmapNodeDocument>;
	let subscriptionsService: SubscriptionsService;
	let streamService: StreamService;
	let openai: OpenAI;
	let config: Config;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LessonsService,
				{
					provide: getModelToken(Lesson.name),
					useValue: Model,
				},
				{
					provide: getModelToken(RoadmapNode.name),
					useValue: Model,
				},
				{
					provide: SubscriptionsService,
					useValue: SubscriptionsService,
				},
				{
					provide: StreamService,
					useValue: StreamService,
				},
			],
		}).compile();
		service = module.get<LessonsService>(LessonsService);
		model = module.get<Model<LessonDocument>>(getModelToken(Lesson.name));
		roadmapModel = module.get<Model<RoadmapNodeDocument>>(getModelToken(RoadmapNode.name));
		subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
		streamService = module.get<StreamService>(StreamService);
		openai = new OpenAI({ apiKey: config.openai.dimaApiKey });
		config = getConfiguration();
	});
});
