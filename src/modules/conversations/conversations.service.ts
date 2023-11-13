import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AddMessageDto } from "./dtos/add-message.dto";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly model: Model<ConversationDocument>
	) {}

	public async createConversation() {} // TODO

	public async addMessage(dto: AddMessageDto) {
		const result = await this.model.findOneAndUpdate(
			{ _id: dto.conversationId, owner_id: dto.ownerId },
			{ $push: { messages: { role: dto.role, content: dto.message } } },
			{ new: true }
		);

		if (!result) {
			throw new BadRequestException("Conversation not found or unexpected error");
		}
	}
}
