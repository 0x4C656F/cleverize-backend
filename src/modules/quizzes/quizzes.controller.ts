import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	NotFoundException,
	UseGuards,
	Sse,
	Delete,
	Put,
	Logger,
	Patch,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Model } from "mongoose";
import { Observable } from "rxjs";

import { UserPayload, JWTPayload } from "src/common/user-payload.decorator";

import { AddUserMessageBodyDto } from "./dto/add-user-message.dto";
import { InitQuizByIdBodyDto } from "./dto/init-quiz-by-id.dto";
import { OperateQuizByIdDto } from "./dto/operate-quiz-by-id.dto";
import { QuizzesService } from "./quizzes.service";
import { Quiz, QuizDocument } from "./schema/quiz.schema";
import { StreamService } from "../../common/stream.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreditsGuard } from "../subscriptions/credits.guard";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";

@Controller("quizzes")
export class QuizzesController {
	constructor(
		private readonly service: QuizzesService,
		private readonly streamService: StreamService,
		@InjectModel(Quiz.name) private readonly model: Model<QuizDocument>
	) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Get("/:quizId")
	async getQuizById(@Param() parameters: OperateQuizByIdDto, @UserPayload() payload: JWTPayload) {
		const quiz = await this.service.getQuizById(parameters.quizId);
		if (quiz.owner_id !== payload.sub) {
			throw new NotFoundException("Quiz not found");
		}
		return quiz;
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard, CreditsGuard(INIT_LESSON_CREDIT_COST))
	@Post("/:quizId/init")
	initQuiz(
		@Body() dto: InitQuizByIdBodyDto,
		@Param() parameters: OperateQuizByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		void this.service.initQuiz(Object.assign(dto, parameters, { user_id: payload.sub }));
	}

	@Sse(":quizId/stream")
	stream(@Param("quizId") quizId: string): Observable<MessageEvent> {
		return new Observable((subscriber) => {
			this.streamService.addSubscriber(quizId, subscriber);
			return () => this.streamService.closeStream(quizId);
		});
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard, CreditsGuard(ADD_MESSAGE_CREDIT_COST))
	@Put("/:quizId/messages")
	addMessage(
		@Param() parameters: OperateQuizByIdDto,
		@Body() dto: AddUserMessageBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		void this.service.addUserMessage(Object.assign(dto, parameters, { user_id: payload.sub }));
	}

	@Patch(":quizId")
	@UseGuards(AuthGuard, CreditsGuard(1))
	restartQuizById(@Param("quizId") id: string) {
		void this.service.restartQuiz({ quizId: id });
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Delete("/:quizId")
	async deleteConversationById(
		@Param() parameters: OperateQuizByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		try {
			return await this.model.deleteOne({
				_id: parameters.quizId,
				owner_id: payload.sub,
			});
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
