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
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";
import { Observable } from "rxjs";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { ConversationsService } from "./conversations.service";
import { AddUserMessageBodyDto } from "./dto/add-user-message.dto";
import { InitConversationByIdBodyDto } from "./dto/init-conversation.dto";
import { OperateConversationByIdDto } from "./dto/operate-conversation-by-id.dto";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { CreditsGuard } from "../subscriptions/credits.guard";
import {
	ADD_MESSAGE_CREDIT_COST,
	INIT_CONVERSATION_CREDIT_COST,
} from "../subscriptions/subscription";

@ApiTags("Conversations")
@Controller("users/me/conversations")
export class ConversationsController {
	constructor(
		@InjectModel(Conversation.name) private readonly model: Model<ConversationDocument>,
		private readonly service: ConversationsService,
		private readonly streamService: StreamService
	) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Get("/:conversationId")
	public async getConversationById(
		@Param() parameters: OperateConversationByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		const conversation = await this.model
			.findOne({ _id: parameters.conversationId, owner_id: payload.sub })
			.exec();

		if (!conversation) throw new NotFoundException();
		return conversation;
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"), CreditsGuard(INIT_CONVERSATION_CREDIT_COST))
	@Post("/:conversationId/init")
	async initConversation(
		@Body() dto: InitConversationByIdBodyDto,
		@Param() parameters: OperateConversationByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		return await this.service.initConversation(
			Object.assign(dto, parameters, { user_id: payload.sub })
		);
	}

	@Sse(":conversationId/stream")
	stream(@Param("conversationId") conversationId: string): Observable<MessageEvent> {
		return new Observable((subscriber) => {
			this.streamService.addSubscriber(conversationId, subscriber);
			return () => this.streamService.closeStream(conversationId);
		});
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"), CreditsGuard(ADD_MESSAGE_CREDIT_COST))
	@Put("/:conversationId/messages")
	public async addMessage(
		@Param() parameters: OperateConversationByIdDto,
		@Body() dto: AddUserMessageBodyDto,
		@UserPayload() payload: JWTPayload
	) {
		return await this.service.addUserMessage(
			Object.assign(dto, parameters, { ownerId: payload.sub })
		);
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
	@Delete("/:conversationId")
	public async deleteConversationById(
		@Param() parameters: OperateConversationByIdDto,
		@UserPayload() payload: JWTPayload
	) {
		try {
			return await this.model.deleteOne({
				_id: parameters.conversationId,
				owner_id: payload.sub,
			});
		} catch (error) {
			Logger.error(error);

			throw error;
		}
	}
}
