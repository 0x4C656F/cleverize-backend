import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";

import { CreateFeedbackBodyDto } from "./dto/create-feedback-body.dto";
import { FeedbackService } from "./feedback.service";
import { Feedback } from "./schema/feedback.schema";

describe("FeedbackService", () => {
	let service: FeedbackService;
	let model: Model<Feedback>;
	const mockFeedbackDto: CreateFeedbackBodyDto = {
		lesson_id: "60f1c7a6a2e4c2d5f8b4b1b4",
		rating: 5,
		feedback: "Great lesson",
	};
	const mockPayload = {
		sub: "60f1c7a6a2e4c2d5f8b4b1b4",
	};
	const mockFeedbackService = {
		createFeedback: jest.fn(),
	};
	const mockFeedback = {
		_id: "60f1c7az6a2e4c2d5f8b4b1b4",
		lesson_id: "60f1c7a6a2e4c2d5f8b4b1b4",
		rating: 5,
		feedback: "Great lesson",
		user_id: "60f1c7a6a2e4c2d5f8b4b1b4",
	};
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FeedbackService,
				{
					provide: getModelToken(Feedback.name),
					useValue: mockFeedbackService,
				},
			],
		}).compile();
		model = module.get<Model<Feedback>>(getModelToken(Feedback.name));
		service = module.get<FeedbackService>(FeedbackService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
		expect(model).toBeDefined();
	});

	it("should create feedback", async () => {
		jest.spyOn(mockFeedbackService, "createFeedback").mockResolvedValue(mockFeedback);
		expect(await service.createFeedback(mockFeedbackDto, mockPayload)).toEqual(mockFeedback);
	});
});
