import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
	Sse,
	UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";
import { Observable } from "rxjs";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { AddUserMessageBodyDto } from "./dto/add-user-message.dto";
import { InitLessonByIdBodyDto } from "./dto/init-lesson.dto";
import { OperateLessonByIdDto } from "./dto/operate-lesson.dto";
import { LessonsService } from "./lessons.service";
import { Lesson, LessonDocument } from "./schema/lesson.schema";
import { StreamService } from "../../common/stream.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreditsGuard } from "../subscriptions/credits.guard";
import { ADD_MESSAGE_CREDIT_COST, INIT_LESSON_CREDIT_COST } from "../subscriptions/subscription";

@ApiTags("Lessons")
@Controller("lessons")
export class LessonController {
	constructor(
		@InjectModel(Lesson.name) private readonly model: Model<LessonDocument>,
		private readonly service: LessonsService,
		private readonly streamService: StreamService
	) {}

	@UseGuards(AuthGuard)
	@Get("/:lessonId")
	public async getConversationById(@Param() parameters: OperateLessonByIdDto) {
		const lesson = await this.model.findOne({ _id: parameters.lessonId }).exec();

		if (!lesson) throw new NotFoundException();
		return lesson;
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard, CreditsGuard(INIT_LESSON_CREDIT_COST))
	@Post("/:lessonId/init")
	initConversation(
		@Body() dto: InitLessonByIdBodyDto,
		@Param() parameters: OperateLessonByIdDto,
		@UserPayload() payload: JWTPayload
	): void {
		void this.service.initLesson(Object.assign(dto, parameters, { user_id: payload.sub }));
	}

	@Sse("/:lessonId/stream")
	stream(@Param("lessonId") lessonId: string): Observable<MessageEvent> {
		return new Observable((subscriber) => {
			this.streamService.addSubscriber(lessonId, subscriber);
			return () => this.streamService.closeStream(lessonId);
		});
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard, CreditsGuard(ADD_MESSAGE_CREDIT_COST))
	@Put("/:lessonId/messages")
	addMessage(
		@Param("lessonId") lessonId: OperateLessonByIdDto,
		@Body() dto: AddUserMessageBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		void this.service.addUserMessage(Object.assign(dto, lessonId, { user_id: payload.sub }));
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Delete("/:lessonId")
	async deleteConversationById(
		@Param() parameters: OperateLessonByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		try {
			return await this.model.deleteOne({
				_id: parameters.lessonId,
				owner_id: payload.sub,
			});
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
