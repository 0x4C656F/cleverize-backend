import { NotFoundException } from "@nestjs/common";
import { getModelToken, raw } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { Model, Types } from "mongoose";
import { ChatCompletion } from "openai/resources";

import { SUPPORTED_LANGUAGES } from "src/common/constants";
import { StreamService } from "src/common/stream.service";

import { GenerateRootRoadmapDto } from "./dto/generate-root-roadmap.dto";
import mediumTemplate from "./prompts/md-roadmap.prompt";
import { RoadmapNodesService } from "./roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeDocument, RoadmapSize } from "./schema/roadmap-nodes.schema";
import { RawRoadmap } from "./types/raw-roadmap";
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
		create: jest.fn(),
	};
	let userModel: Model<UserDocument>;
	let lessonModel: Model<Lesson>;
	let quizModel: Model<Quiz>;
	const userId = new Types.ObjectId();
	const roadmapId = new Types.ObjectId();
	const roadmapNode = new Types.ObjectId();

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

	const mockUserDocument = {
		...mockUser,
		save: jest.fn(),
		markModified: jest.fn(),
	};
	const mockRoadmap: RoadmapNode = {
		_id: roadmapId,
		title: "Python",
		owner_id: mockUser._id.toString(),
		children: [
			{
				_id: new Types.ObjectId(),
				title: "Introduction",
				owner_id: mockUser._id.toString(),
				children: [
					{
						_id: new Types.ObjectId(),
						title: "Setting up Python",
						owner_id: mockUser._id.toString(),
						parent_node_id: roadmapNode.toString(),
						children: [],
						is_completed: false,
					},
				],
				is_completed: false,
			},
			{
				_id: new Types.ObjectId(),
				title: "Basics",
				owner_id: mockUser._id.toString(),
				children: [
					{
						_id: new Types.ObjectId(),
						title: "Variables and Data Types",
						owner_id: mockUser._id.toString(),
						parent_node_id: roadmapNode.toString(),
						children: [],
						is_completed: false,
					},
				],
				is_completed: false,
			},
		],
		is_completed: false,
	};
	const mockRoadmapDocument = {
		...mockRoadmap,
		save: jest.fn(),
		children: [
			{
				...mockRoadmap.children[0],
				save: jest.fn(),
				children: [
					{
						...mockRoadmap.children[0].children[0],
						save: jest.fn(),
					},
				],
			},
			{
				...mockRoadmap.children[1],
				save: jest.fn(),
				children: [
					{
						...mockRoadmap.children[1].children[0],
						save: jest.fn(),
					},
				],
			},
		],
	};

	const rawRoadmap: RawRoadmap = {
		title: mockRoadmap.title,
		children: [
			{
				title: mockRoadmap.children[0].title,
				children: [
					{
						title: mockRoadmap.children[0].children[0].title,
						children: [],
					},
				],
			},
			{
				title: mockRoadmap.children[1].title,
				children: [
					{
						title: mockRoadmap.children[1].children[0].title,
						children: [],
					},
				],
			},
		],
	};

	beforeEach(async () => {
		model = {
			find: jest.fn(),
			create: jest.fn(),
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
	describe("getAllUserRoadmaps", () => {
		it("should fetch all user roadmaps successfully for an existing user with roadmaps", async () => {
			const owner_id = mockUser._id.toString();
			jest
				.spyOn(service, "getAllUserRoadmaps")
				.mockResolvedValue([mockRoadmap as RoadmapNodeDocument]);

			jest
				.spyOn(model, "find")
				.mockResolvedValue(Promise.resolve([mockRoadmap] as RoadmapNodeDocument[]));
			jest
				.spyOn(usersService, "findById")
				.mockResolvedValue(Promise.resolve(mockUser as UserDocument));
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
	});

	describe("generateRootRoadmap", () => {
		it("should generate a root roadmap successfully", async () => {
			const dto: GenerateRootRoadmapDto = {
				user_id: mockUser._id.toString(),
				size: RoadmapSize.MEDIUM,
				title: mockRoadmap.title,
			};

			jest
				.spyOn(usersService, "findById")
				.mockResolvedValue(mockUserDocument as unknown as UserDocument);
			jest.spyOn(service, "generateRoadmap").mockResolvedValue(rawRoadmap);
			jest.spyOn(service, "saveRoadmap").mockResolvedValue(mockRoadmap as RoadmapNodeDocument);
			jest.spyOn(mockUser.roadmaps, "push");
			jest.spyOn(mockUserDocument, "save");

			const roadmap = await service.generateRootRoadmap(dto);

			expect(usersService.findById).toBeCalledWith(dto.user_id);
			expect(mockUserDocument.save).toBeCalled();
			expect(mockUser.roadmaps.push).toBeCalledWith(mockRoadmap._id);
			expect(service.generateRoadmap).toBeCalledWith(dto.title, dto.size);
			expect(service.saveRoadmap).toBeCalledWith(rawRoadmap, dto.user_id, dto.size);
			expect(roadmap).toBeUndefined();
		});
	});

	describe("generateRoadmap", () => {
		it("should generate a roadmap successfully", async () => {
			const completionResponse = {
				choices: [{ message: { content: JSON.stringify(rawRoadmap) } }],
			};

			jest
				.spyOn(service.openai.chat.completions, "create")
				.mockResolvedValue(completionResponse as ChatCompletion);

			const result = await service.generateRoadmap(rawRoadmap.title, RoadmapSize.MEDIUM);

			expect(service.openai.chat.completions.create).toHaveBeenCalledWith({
				messages: [{ role: "system", content: mediumTemplate(rawRoadmap.title) }],
				model: "gpt-3.5-turbo-1106",
				max_tokens: 1500,
			});
			expect(service.openai.chat.completions.create).toHaveBeenCalledTimes(1);
			expect(service);
			expect(result).toEqual(rawRoadmap); // Validate the response is correctly parsed
		});
	});

	describe("saveRoadmap", () => {
		it("should create a roadmap node with children", async () => {
			// Simulated raw roadmap structure with one child

			jest
				.spyOn(service, "saveRoadmap")
				.mockResolvedValue(mockRoadmap as RoadmapNodeDocument);

			const result = await service.saveRoadmap(
				rawRoadmap,
				mockRoadmapDocument.owner_id,
				mockRoadmapDocument.size
			);

			expect(result).toEqual(mockRoadmapDocument);
		});
	});
});
