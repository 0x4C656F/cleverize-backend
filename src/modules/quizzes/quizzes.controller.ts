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
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
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
	@UseGuards(AuthGuard("jwt"))
	@Get("/:quizId")
	async getQuizById(@Param() parameters: OperateQuizByIdDto, @UserPayload() payload: JWTPayload) {
		const quiz = await this.model.findOne({ _id: parameters.quizId, owner_id: payload.sub }).exec();

		if (!quiz) throw new NotFoundException("Could not find quiz with given id");
		return quiz;
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"), CreditsGuard(INIT_LESSON_CREDIT_COST))
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
	@UseGuards(AuthGuard("jwt"), CreditsGuard(ADD_MESSAGE_CREDIT_COST))
	@Put("/:lessonId/messages")
	addMessage(
		@Param() parameters: OperateQuizByIdDto,
		@Body() dto: AddUserMessageBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		void this.service.addUserMessage(Object.assign(dto, parameters, { user_id: payload.sub }));
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Delete("/:lessonId")
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
