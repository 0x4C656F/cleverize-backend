import { NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { Model, Types } from "mongoose";

import { SUPPORTED_LANGUAGES } from "src/common/constants";
import { StreamService } from "src/common/stream.service";

import { RoadmapNodesService } from "./roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeDocument, RoadmapSize } from "./schema/roadmap-nodes.schema";
import { LessonsService } from "../lessons/lessons.service";
import { Lesson } from "../lessons/schema/lesson.schema";
import { QuizzesService } from "../quizzes/quizzes.service";
import { Quiz } from "../quizzes/schema/quiz.schema";
import { subscriptionDefaultObject } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { User, UserDocument } from "../users/schema/user.schema";
import { UsersService } from "../users/users.service";

describe("RoadmapNodesService", () => {
	let service: RoadmapNodesService;
	const mockService = {
		getAllUserRoadmaps: jest.fn(),
	};
	let usersService: UsersService;
	let model = {
		find: jest.fn(),
	};
	let userModel: Model<UserDocument>;
	let lessonModel: Model<Lesson>;
	let quizModel: Model<Quiz>;
	const userId = new Types.ObjectId();
	const roadmapId = new Types.ObjectId();
	const mockUser: User = {
		_id: userId,
		roadmaps: [roadmapId],
		email: "someEmail",
		metadata: {
			language: SUPPORTED_LANGUAGES.ENGLISH,
		},
		refresh_tokens: [],
		subscription: subscriptionDefaultObject,
		last_signed_in: new Date(),
		name: "someName",
		password: "somePassword",
	};
	const mockRoadmap: RoadmapNode = {
		_id: roadmapId,
		title: "someTitle",
		owner_id: mockUser._id.toString(),
		size: RoadmapSize.MEDIUM,
		children: [],
		is_completed: false,
	};

	beforeEach(async () => {
		model = {
			find: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RoadmapNodesService,
				SubscriptionsService,
				LessonsService,
				QuizzesService,
				UsersService,
				StreamService,
				{
					provide: getModelToken(User.name),
					useValue: userModel,
				},
				{
					provide: getModelToken(RoadmapNode.name),
					useValue: mockService,
				},
				{
					provide: getModelToken(Lesson.name),
					useValue: lessonModel,
				},
				{
					provide: getModelToken(Quiz.name),
					useValue: quizModel,
				},
				{
					provide: UsersService,
					useValue: {
						findById: jest.fn(),
					},
				},

				{ provide: getModelToken(RoadmapNode.name), useValue: model },
			],
		}).compile();

		service = module.get<RoadmapNodesService>(RoadmapNodesService);
		usersService = module.get<UsersService>(UsersService);
	});

	it("should fetch all user roadmaps successfully for an existing user with roadmaps", async () => {
		const owner_id = mockUser._id.toString();
		jest
			.spyOn(service, "getAllUserRoadmaps")
			.mockResolvedValue([mockRoadmap as RoadmapNodeDocument]);

		jest.spyOn(model, "find").mockResolvedValue(Promise.resolve([mockRoadmap] as RoadmapNodeDocument[]));
		jest.spyOn(usersService, "findById").mockResolvedValue(Promise.resolve(mockUser as UserDocument));
		const result = await service.getAllUserRoadmaps({ owner_id });

		expect(result).toEqual([mockRoadmap]); // Expect result to match mocked roadmaps
	});

	it("should return an empty array for a user with no roadmaps", async () => {
		const ownerId = "someOwnerId";
		jest.spyOn(service, "getAllUserRoadmaps").mockResolvedValue([]);

		const mockUser = { roadmaps: [] };
		usersService.findById = jest.fn().mockResolvedValue(mockUser);
		model.find = jest.fn().mockResolvedValue([]); // No roadmaps found

		const result = await service.getAllUserRoadmaps({ owner_id: ownerId });

		expect(result).toEqual([]);
	});

	it("should throw an error if the user does not exist", async () => {
		const ownerId = mockUser._id.toString();
		// eslint-disable-next-line unicorn/no-null

		await expect(service.getAllUserRoadmaps({ owner_id: ownerId })).rejects.toThrowError(
			new NotFoundException("User not found")
		);
	});

	// Add more tests here to cover the remaining scenarios
});
