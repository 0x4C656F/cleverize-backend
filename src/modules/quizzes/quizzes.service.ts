import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

import { StreamService } from "src/common/stream.service";
import getConfiguration from "src/config/configuration";

import { AddUserMessageDto } from "./dto/add-user-message.dto";
import { InitQuizByIdDto } from "./dto/init-quiz-by-id.dto";
import RestartQuizByIdDto from "./dto/restart-quiz-by-id.dto";
import getChildrenArray from "./helpers/get-children-array";
import quizPrompt from "./prompts/quiz.prompt";
import { Quiz, QuizDocument } from "./schema/quiz.schema";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class QuizzesService {
	private openai: OpenAI;

	constructor(
		@InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
		@InjectModel(RoadmapNode.name) private readonly roadmapModel: Model<RoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly userService: UsersService,
		private readonly streamService: StreamService
	) {
		this.openai = new OpenAI({
			apiKey: getConfiguration().openai.dimaApiKey,
		});
	}

	public async addUserMessage(dto: AddUserMessageDto): Promise<void> {
		const quiz = await this.getQuizById(dto.quizId);
		quiz.messages.push({ role: dto.role, content: dto.content });

		const aiResponse = await this.getAiResponse(quiz.messages as ChatCompletionMessageParam[]);
		quiz.messages.push({ role: "assistant", content: aiResponse });

		await this.finalizeQuizInteraction(quiz, dto.user_id, ADD_MESSAGE_CREDIT_COST);
	}

	public async restartQuiz(dto: RestartQuizByIdDto): Promise<void> {
		const quiz = await this.getQuizById(dto.quizId);
		quiz.messages = []; // Clear messages or set to initial state as required
		await quiz.save();
	}

	public async initQuiz(dto: InitQuizByIdDto): Promise<void> {
		const user = await this.userService.findById(dto.user_id);
		const language = user.metadata.language;
		const roadmap = await this.getRoadmapById(dto.roadmapId);
		const quiz: QuizDocument = await this.getQuizById(dto.quizId);

		if (quiz.messages.length > 0) return;

		const children = getChildrenArray(roadmap);
		const prompt = quizPrompt(children, language, roadmap.title);
		const aiResponse = await this.getAiResponse([{ role: "system", content: prompt }]);

		quiz.messages.push(
			{ role: "system", content: prompt },
			{ role: "assistant", content: aiResponse }
		);
		await this.finalizeQuizInteraction(quiz, dto.user_id, INIT_LESSON_CREDIT_COST);
	}

	private async getAiResponse(messages: ChatCompletionMessageParam[]): Promise<string> {
		let response = "";
		const completion = await this.openai.chat.completions.create({
			messages,
			model: "gpt-3.5-turbo-1106",
			stream: true,
			max_tokens: 2000,
		});

		for await (const part of completion) {
			response += part.choices[0].delta.content ?? "";
		}
		return response;
	}

	private async finalizeQuizInteraction(
		quiz: QuizDocument,
		userId: string,
		creditCost: number
	): Promise<void> {
		this.streamService.closeStream(quiz._id.toString());
		await quiz.save();
		await this.subscriptionsService.deductCredits(userId, creditCost);
		this.streamService.sendData(quiz._id.toString(), JSON.stringify(quiz.messages));
		this.streamService.closeStream(quiz._id.toString()); // Verify if needed twice
	}

	private async getQuizById(quizId: string): Promise<QuizDocument> {
		const quiz = await this.quizModel.findById(quizId);
		if (!quiz) throw new NotFoundException("Quiz not found");
		return quiz;
	}

	private async getRoadmapById(roadmapId: string): Promise<RoadmapNodeDocument> {
		const roadmap = await this.roadmapModel.findById(roadmapId);
		if (!roadmap) throw new NotFoundException("Roadmap not found");
		return roadmap;
	}
}
