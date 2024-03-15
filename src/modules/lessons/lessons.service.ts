import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

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
	private openai: OpenAI;

	constructor(
		@InjectModel(Lesson.name) private readonly model: Model<LessonDocument>,
		@InjectModel(RoadmapNode.name) private readonly roadmapModel: Model<RoadmapNodeDocument>,
		private readonly userService: UsersService,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {
		this.openai = new OpenAI({
			apiKey: getConfiguration().openai.dimaApiKey,
		});
	}

	public async addUserMessage(dto: AddUserMessageDto): Promise<void> {
		const { lessonId, content, user_id } = dto;
		const lesson = await this.findLessonAndUpdateMessages(lessonId, {
			role: MessageRole.USER,
			content,
		});
		const completeAiResponse = await this.generateAiResponse(
			lesson.messages as ChatCompletionMessageParam[],
			"gpt-4"
		);
		await this.appendAiResponseAndFinalize(
			lesson,
			completeAiResponse,
			user_id,
			ADD_MESSAGE_CREDIT_COST
		);
	}

	public async initLesson(dto: InitLessonByIdDto): Promise<Lesson> {
		const user = await this.userService.findById(dto.user_id);
		const language = user.metadata.language;
		const lesson = await this.findLesson(dto.lessonId);
		if (lesson.messages.length > 0) return lesson;

		const [roadmap]: RoadmapNodeDocument[] = await this.roadmapModel.find({ _id: dto.roadmap_id });
		const roadmapForAi = roadmapParser(roadmap);
		const prompt = lessonPrompt(language, lesson.title, roadmapForAi, roadmap.title);
		const aiResponse = await this.generateAiResponse(
			[{ role: "system", content: prompt }],
			"gpt-3.5-turbo-1106"
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

	private async findLesson(lessonId: string): Promise<LessonDocument> {
		const lesson = await this.model.findById(lessonId);
		if (!lesson) throw new NotFoundException("Lesson not found");
		return lesson;
	}

	private async findLessonAndUpdateMessages(
		lessonId: string,
		message: Message
	): Promise<LessonDocument> {
		return this.model
			.findByIdAndUpdate(lessonId, {
				$push: { messages: message },
			})
			.exec();
	}

	private async generateAiResponse(
		messages: ChatCompletionMessageParam[],
		model: string
	): Promise<string> {
		let aiResponse = "";
		const completion = await this.openai.chat.completions.create({
			messages,
			model,
			stream: true,
			max_tokens: 2000,
		});
		for await (const part of completion) {
			aiResponse += part.choices[0].delta.content ?? "";
		}
		return aiResponse;
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
		lesson.messages.push({ role: "assistant", content: aiResponse });
		await lesson.save();
		this.streamService.sendData(lesson._id.toString(), aiResponse);
		this.streamService.closeStream(lesson._id.toString());
		await this.subscriptionsService.deductCredits(userId, creditCost);
	}

	public async createLesson(lesson: Lesson): Promise<LessonDocument> {
		return await this.model.create(lesson);
	}
}
