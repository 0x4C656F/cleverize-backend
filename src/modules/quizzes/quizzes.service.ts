import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { StreamService } from "src/common/stream.service";
import getConfig from "src/config/config";

import { AddUserMessageDto } from "./dto/add-user-message.dto";
import { InitQuizByIdDto } from "./dto/init-quiz-by-id.dto";
import RestartQuizByIdDto from "./dto/restart-quiz-by-id.dto";
import getChildrenArray from "./helpers/get-children-array";
import quizPrompt from "./prompts/quiz.prompt";
import { Quiz, QuizDocument } from "./schema/quiz.schema";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
@Injectable()
export class QuizzesService {
	private openai: OpenAI;
	constructor(
		@InjectModel(Quiz.name) private readonly model: Model<QuizDocument>,
		@InjectModel(RoadmapNode.name)
		private readonly roadmapModel: Model<RoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {
		this.openai = new OpenAI({
			apiKey: getConfig().openai.levApiKey,
		});
	}

	public async addUserMessage(dto: AddUserMessageDto): Promise<void> {
		const { quizId, content, role, user_id } = dto;
		this.streamService.closeStream(quizId);
		const quiz = await this.model.findById(quizId);

		quiz.messages.push({
			role: role,
			content: content,
		});

		let completeAiResponse = "";

		const completion = await this.openai.chat.completions.create({
			messages: quiz.messages as ChatCompletionMessageParam[],
			model: "gpt-4",
			stream: true,
			max_tokens: 2000,
		});

		for await (const part of completion) {
			const textChunk = part.choices[0].delta.content ?? "";
			completeAiResponse += textChunk;
			this.streamService.sendData(quizId, completeAiResponse);
		}

		quiz.messages.push({
			role: "assistant",
			content: completeAiResponse,
		});

		this.streamService.closeStream(quizId);
		void this.subscriptionsService.deductCredits(user_id, ADD_MESSAGE_CREDIT_COST);
		await quiz.save();
	}

	public async restartQuiz(dto: RestartQuizByIdDto) {
		const { quizId } = dto;
		const quiz = await this.model.findById(quizId);
		quiz.messages = quiz.messages.slice(1);
		await quiz.save();
	}
	
	public async initQuiz(dto: InitQuizByIdDto): Promise<void> {
		const { quizId, language, roadmapId, user_id } = dto;

		const [roadmap] = await this.roadmapModel.find({ _id: roadmapId });

		try {
			const quiz = await this.model.findById(quizId);

			if (!quiz) throw new NotFoundException("Quiz not found");

			if (quiz.messages.length > 0) return;

			const arrayOfChildren = getChildrenArray(roadmap);

			const prompt = quizPrompt(arrayOfChildren, language, roadmap.title);

			let completeAiResponseString: string = "";
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
				completeAiResponseString += chunk;
				this.streamService.sendData(quizId, completeAiResponseString);
			}

			const systemMessage = {
				role: "system",
				content: prompt,
			};
			const assistantMessage = {
				role: "assistant",
				content: completeAiResponseString,
			};

			await this.model.findByIdAndUpdate(quiz.node_id, {
				$set: { is_completed: true },
			});

			quiz.messages.push(systemMessage, assistantMessage);

			this.streamService.closeStream(quizId);

			void this.subscriptionsService.deductCredits(user_id, INIT_LESSON_CREDIT_COST);

			await quiz.save();
		} catch (error) {
			console.error("Error in initQuiz:", error);
			throw error;
		}
	}
}
