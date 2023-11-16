import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	Post,
	Sse,
	UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Model } from "mongoose";
import { Observable, map } from "rxjs";

import { JWTPayload, UserPayload } from "src/common/user-payload.decorator";

import { ConversationsService } from "./conversations.service";
import { ConversationStartDto } from "./dtos/init-conversation-dto";
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
	@Post("/:conversationId/start")
	async initConversation(
		@Body() dto: ConversationStartDto,
		@Param("convresationId") conversationId: string
	) {
		console.log(dto.node_title);
		await this.service.initConversation(dto.node_title, dto.user_roadmap_id, conversationId);
	}

	@Sse("stream/:conversationId")
	stream(@Param("conversationId") conversationId: string): Observable<any> {
		return this.streamService.getDataStream(conversationId).pipe(map((data) => ({ data })));
	}

	// @ApiBearerAuth()
	// @UseGuards(AuthGuard("jwt"))
	// @Put("/:conversationId")
	// public async addMessage(
	// 	@Param() parameters: OperateConversationByIdDto,
	// 	@Body() dto: AddMessageBodyDto,
	// 	@UserPayload() payload: JWTPayload
	// ) {
	// 	return await this.service.addMessage(Object.assign(dto, parameters, { ownerId: payload.sub }));
	// }

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
