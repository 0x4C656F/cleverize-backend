import { Content, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { StreamService } from "src/common/stream.service";
import getConfiguration from "src/config/configuration";

import { AddUserMessageDto, MessageRole } from "./dto/add-user-message.dto";
import { InitLessonByIdDto } from "./dto/init-lesson.dto";
import roadmapParser from "./helpers/roadmap-parser";
import { lessonPrompt } from "./prompts/lesson.prompt";
import { Lesson, LessonDocument, Message } from "./schema/lesson.schema";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UsersService } from "../users/users.service";
@Injectable()
export class LessonsService {
	private gga: GoogleGenerativeAI = new GoogleGenerativeAI(getConfiguration().geminiApiKey);
	private gemini: GenerativeModel;

	constructor(
		@InjectModel(Lesson.name) private readonly model: Model<LessonDocument>,
		@InjectModel(RoadmapNode.name) private readonly roadmapModel: Model<RoadmapNodeDocument>,
		private readonly userService: UsersService,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {
		this.gemini = this.gga.getGenerativeModel({ model: "gemini-1.5-pro" });
	}
	public async addUserMessage(dto: AddUserMessageDto): Promise<void> {
		const { lessonId, content, user_id } = dto;
		const less: LessonDocument = await this.findLesson(lessonId);
		if (!less) throw new NotFoundException("Lesson not found");
		less.messages.push({ role: MessageRole.USER, content });
		await less.save();
		const generatedResponse = await this.generateAiResponse(less.messages, lessonId);
		await this.appendAiResponseAndFinalize(
			less,
			generatedResponse,
			user_id,
			ADD_MESSAGE_CREDIT_COST
		);

		await this.appendAiResponseAndFinalize(
			less,
			generatedResponse,
			user_id,
			ADD_MESSAGE_CREDIT_COST
		);
	}

	public async initLesson(dto: InitLessonByIdDto): Promise<Lesson> {
		const user = await this.userService.findById(dto.user_id);
		const language = user.metadata.language;
		const lesson = await this.findLesson(dto.lessonId);
		if (lesson.messages.length > 0) return lesson;

		const sectionRoadmap: RoadmapNodeDocument = await this.roadmapModel.findById(dto.roadmap_id);
		const [roadmap]: RoadmapNodeDocument[] = await this.roadmapModel.find({
			_id: sectionRoadmap.parent_node_id,
		});
		const roadmapForAi = roadmapParser(roadmap);
		const prompt = lessonPrompt(language, lesson.title, roadmapForAi, roadmap.title);

		const aiResponse = await this.generateAiResponse(
			[{ role: "user", content: prompt }],
			lesson._id.toString()
		);

		await this.appendAiResponseAndFinalize(
			lesson,
			aiResponse,
			dto.user_id,
			INIT_LESSON_CREDIT_COST,
			prompt
		);
		return lesson;
	}

	private async generateAiResponse(messages: Message[], lessonId: string): Promise<string> {
		let aiResponse = "";
		const contents = this.messageToContext(messages);
		const response = await this.gemini.generateContentStream({
			contents,
		});
		for await (const chunk of response.stream) {
			aiResponse += chunk.text();
			this.streamService.sendData(lessonId, aiResponse);
		}
		return aiResponse;
	}
	private messageToContext(messages: Message[]): Content[] {
		return messages.map((message) => {
			if (message.role === "system") {
				return {
					role: "user",
					parts: [{ text: message.content }],
				};
			} else {
				return {
					role: message.role,
					parts: [{ text: message.content }],
				};
			}
		});
	}

	private async appendAiResponseAndFinalize(
		lesson: LessonDocument,
		aiResponse: string,
		userId: string,
		creditCost: number,
		systemMessageContent?: string
	): Promise<void> {
		this.streamService.closeStream(lesson._id.toString());
		if (systemMessageContent) {
			lesson.messages.push({ role: "system", content: systemMessageContent });
		}
		lesson.messages.push({ role: "model", content: aiResponse });
		await lesson.save();
		await this.subscriptionsService.deductCredits(userId, creditCost);
	}

	public async createLesson(lesson: Lesson): Promise<LessonDocument> {
		return await this.model.create(lesson);
	}

	private async findLesson(lessonId: string): Promise<LessonDocument> {
		return await this.model.findById(lessonId);
	}
}
