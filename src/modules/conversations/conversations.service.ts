import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AddUserMessageDto } from "./dto/add-user-message.dto";
import { InitConversationByIdDto } from "./dto/init-conversation.dto";
import generateResponse from "./logic/generate-response";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import {
	ADD_MESSAGE_CREDIT_COST,
	INIT_CONVERSATION_CREDIT_COST,
} from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import {
	UserRoadmapNode,
	UserRoadmapNodeDocument,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmapNode.name) private readonly model: Model<UserRoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {}

	public async addUserMessage(dto: AddUserMessageDto) {
		const { conversationId, content, role, user_id } = dto;
		const conversation = await this.conversationModel.findById(conversationId);
		conversation.messages.push({
			role: role,
			content: content,
		});
		let fullAiResponseString = "";
		const completion = await generateResponse(conversation.messages);
		for await (const part of completion) {
			const text = part.choices[0].delta.content ?? ""; 
			fullAiResponseString += text; 

			this.streamService.sendData(conversationId, fullAiResponseString);
		}
		conversation.messages.push({
			role: "assistant",
			content: fullAiResponseString,
		});

		await conversation.save();
		this.streamService.closeStream(conversationId);
		void this.subscriptionsService.deductCredits(user_id, ADD_MESSAGE_CREDIT_COST);
		return "ok";
	}

	async initConversation(dto: InitConversationByIdDto): Promise<Conversation> {
		const { conversationId, user_id } = dto;
		try {
			const conversation = await this.conversationModel.findById(conversationId);
			if (conversation.messages.length > 0) {
				return conversation;
			}

			const fullAiResponse = async () => {
				let fullAiResponseString: string = "";
				const completion = await generateResponse(conversation.messages);
				for await (const part of completion) {
					const chunk = part.choices[0].delta.content ?? "";
					fullAiResponseString += chunk;
					this.streamService.sendData(conversationId, fullAiResponseString);
				}

				conversation.messages.push({ role: "assistant", content: fullAiResponseString });

				this.streamService.closeStream(conversationId);

				void this.subscriptionsService.deductCredits(user_id, INIT_CONVERSATION_CREDIT_COST);

				return await conversation.save();
			};
			return await fullAiResponse();
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}
