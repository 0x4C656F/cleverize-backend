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
import { AddUserMessageBodyDto } from "./dtos/add-user-message.dto";
import { InitConversationByIdBodyDto } from "./dtos/init-conversation.dto";
import { OperateConversationByIdDto } from "./dtos/operate-conversation-by-id.dto";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";

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
	@UseGuards(AuthGuard("jwt"))
	@Post("/:conversationId/init")
	async initConversation(
		@Body() dto: InitConversationByIdBodyDto,
		@Param() parameters: OperateConversationByIdDto
	) {
		console.log("triggered init in controller,", dto);
		return await this.service.initConversation(Object.assign(dto, parameters));
	}

	@Sse(":conversationId/stream")
	stream(@Param("conversationId") conversationId: string): Observable<MessageEvent> {
		return new Observable((subscriber) => {
			this.streamService.addSubscriber(conversationId, subscriber);
			return () => this.streamService.closeStream(conversationId);
		});
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard("jwt"))
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
