import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

import { StreamService } from "src/common/stream.service";
import getConfiguration from "src/config/configuration";

import { AddUserMessageDto, MessageRole } from "./dto/add-user-message.dto";
import { InitQuizByIdDto } from "./dto/init-quiz-by-id.dto";
import RestartQuizByIdDto from "./dto/restart-quiz-by-id.dto";
import quizPrompt from "./prompts/quiz.prompt";
import { Quiz, QuizDocument } from "./schema/quiz.schema";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { ADD_MESSAGE_CREDIT_COST, INIT_QUIZ_CREDIT_COST } from "../subscriptions/subscription";
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
		const { user_id, content, quizId } = dto;
		const role = MessageRole.USER;
		const quiz = await this.getQuizById(quizId);
		quiz.messages.push({ role, content });

		const aiResponse = await this.getAiResponse(
			quiz.messages as ChatCompletionMessageParam[],
			quiz._id.toString()
		);
		quiz.messages.push({ role: "assistant", content: aiResponse });

		await this.finalizeQuizInteraction(quiz, user_id, ADD_MESSAGE_CREDIT_COST);
		await quiz.save();
	}

	public async restartQuiz(dto: RestartQuizByIdDto): Promise<void> {
		const quiz = await this.getQuizById(dto.quizId);
		quiz.messages = [];
		await quiz.save();
	}

	public async initQuiz(dto: InitQuizByIdDto): Promise<void> {
		const user = await this.userService.findById(dto.user_id);
		const language = user.metadata.language;
		const sectionRoadmap = await this.getRoadmapById(dto.roadmapId);
		const roadmap = await this.roadmapModel.findById(sectionRoadmap.parent_node_id);
		const quiz: QuizDocument = await this.getQuizById(dto.quizId);

		if (quiz.messages.length > 0) return;

		const prompt = quizPrompt(quiz.covered_material, language, roadmap.title, sectionRoadmap.title);
		const aiResponse = await this.getAiResponse(
			[{ role: "system", content: prompt }],
			quiz._id.toString()
		);

		quiz.messages.push(
			{ role: "system", content: prompt },
			{ role: "assistant", content: aiResponse }
		);
		await this.finalizeQuizInteraction(quiz, dto.user_id, INIT_QUIZ_CREDIT_COST);
		await quiz.save();
	}

	private async getAiResponse(
		messages: ChatCompletionMessageParam[],
		quizId: string
	): Promise<string> {
		let response = "";
		const completion = await this.openai.chat.completions.create({
			messages,
			model: "gpt-3.5-turbo-1106",
			stream: true,
			max_tokens: 2000,
		});

		for await (const part of completion) {
			response += part.choices[0].delta.content ?? "";
			this.streamService.sendData(quizId, response);
		}
		return response;
	}

	private async finalizeQuizInteraction(
		quiz: QuizDocument,
		userId: string,
		creditCost: number
	): Promise<void> {
		this.streamService.closeStream(quiz._id.toString());

		await this.subscriptionsService.deductCredits(userId, creditCost);
		this.streamService.closeStream(quiz._id.toString()); // Verify if needed twice
	}

	public async getQuizById(quizId: string): Promise<QuizDocument> {
		const quiz = await this.quizModel.findById(quizId);
		if (!quiz) throw new NotFoundException("Quiz not found");
		return quiz;
	}

	private async getRoadmapById(roadmapId: string): Promise<RoadmapNodeDocument> {
		const roadmap = await this.roadmapModel.findById(roadmapId);
		if (!roadmap) throw new NotFoundException("Roadmap not found");
		return roadmap;
	}

	public async createQuiz(quiz: Quiz): Promise<QuizDocument> {
		return await this.quizModel.create(quiz);
	}
}
