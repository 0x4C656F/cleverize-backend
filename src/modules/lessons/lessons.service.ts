import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import getConfig, { Config } from "src/config/config";

import { AddUserMessageDto } from "./dto/add-user-message.dto";
import { InitLessonByIdDto } from "./dto/init-lesson.dto";
import roadmapParser from "./helpers/roadmap-parser";
import { lessonPrompt } from "./prompts/lesson.prompt";
import { Lesson, LessonDocument } from "./schema/lesson.schema";
import { StreamService } from "../../common/stream.service";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
@Injectable()
export class LessonsService {
	private openai: OpenAI;
	private config: Config;
	constructor(
		@InjectModel(Lesson.name) private readonly model: Model<LessonDocument>,
		@InjectModel(RoadmapNode.name)
		private readonly roadmapModel: Model<RoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {
		this.config = getConfig();

		this.openai = new OpenAI({
			apiKey: this.config.openai.levApiKey,
		});
	}

	public async addUserMessage(dto: AddUserMessageDto) {
		const { lessonId, content, role, user_id } = dto;
		this.streamService.closeStream(lessonId);
		const lesson = await this.model.findById(lessonId);

		lesson.messages.push({
			role: role,
			content: content,
		});

		let completeAiResponse = "";

		const completion = await this.openai.chat.completions.create({
			messages: lesson.messages as ChatCompletionMessageParam[],
			model: "gpt-4",
			stream: true,
			max_tokens: 2000,
		});

		for await (const part of completion) {
			const textChunk = part.choices[0].delta.content ?? "";
			completeAiResponse += textChunk;
			this.streamService.sendData(lessonId, completeAiResponse);
		}

		lesson.messages.push({
			role: "assistant",
			content: completeAiResponse,
		});

		await lesson.save();
		this.streamService.closeStream(lessonId);
		void this.subscriptionsService.deductCredits(user_id, ADD_MESSAGE_CREDIT_COST);
	}

	async initLesson(dto: InitLessonByIdDto): Promise<Lesson> {
		const { lessonId, language, roadmapId, user_id } = dto;

		const [roadmap] = await this.roadmapModel.find({ _id: roadmapId });

		try {
			const lesson = await this.model.findById(lessonId);

			if (lesson.messages.length > 0) return lesson;
			const roadmapForAi = roadmapParser(roadmap);

			const prompt: string = lessonPrompt(language, lesson.title, roadmapForAi, roadmap.title);

			let fullAiResponseString: string = "";
			const completion = await this.openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: prompt,
					},
				],
				model: "gpt-3.5-turbo-1106",
				stream: true,
				max_tokens: 2000,
			});
			for await (const part of completion) {
				const chunk = part.choices[0].delta.content ?? "";
				fullAiResponseString += chunk;
				this.streamService.sendData(lessonId, fullAiResponseString);
			}

			const message = {
				role: "system",
				content: prompt,
			};
			await this.model.findByIdAndUpdate(lesson.node_id, {
				$set: { is_completed: true },
			});

			lesson.messages.push(message, {
				role: "assistant",
				content: fullAiResponseString,
			});

			this.streamService.closeStream(lessonId);

			void this.subscriptionsService.deductCredits(user_id, INIT_LESSON_CREDIT_COST);

			await lesson.save();
		} catch (error) {
			console.error("Error in initLesson:", error);
			throw error;
		}
	}
}

//TODO + Make a test-lesson with each lesson in roadmap-nodes;
//TODO + Make a prompt for test-lesson;
//TODO + Add test-lesson generation to template roadmaps;
//TODO + Make check for test_id on init lesson
