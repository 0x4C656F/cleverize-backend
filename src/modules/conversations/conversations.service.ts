import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AddUserMessageDto } from "./dtos/add-user-message.dto";
import roadmapParser from "./helpers/roadmap-parser";
import generateAiLesson from "./logic/init-conversation";
import { template } from "./logic/template";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { UserRoadmap, UserRoadmapDocument } from "../user-roadmaps/user-roadmaps.schema";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		private streamService: StreamService
	) {}

	public async addUserMessage(dto: AddUserMessageDto) {
		const { conversationId, content, role, ownerId } = dto;
		const conversation = await this.conversationModel.findById(conversationId);
		conversation.messages.push({
			role: role,
			content: content,
		});
	}

	initConversation(node_title: string, user_roadmap_id: string, conversation_id: string) {
		if (!node_title || !user_roadmap_id || !conversation_id) {
			throw new Error("DTO is missing");
		}

		void this.processConversationInBackground(node_title, user_roadmap_id, conversation_id);
		return "ok";
	}
	private async processConversationInBackground(
		node_title: string,
		user_roadmap_id: string,
		conversation_id: string
	) {
		const user_roadmap = await this.model.findById(user_roadmap_id);
		const roadmapForAi = roadmapParser(user_roadmap, node_title);
		try {
			let full = "";
			const completion = await generateAiLesson(node_title, roadmapForAi);
			for await (const part of completion) {
				const text = part.choices[0].delta.content ?? ""; // 'Text' is one small piece of answer, like: 'Hello', 'I', '`', 'am' ...
				full += text; //'Full' is the full text which you build piece by piece
				this.streamService.sendData(conversation_id, full); //Idk what this does), it is supposed to do some magic and stream full text
			}

			const conversation = await this.conversationModel.findById(conversation_id);
			if (conversation) {
				const message = {
					role: "system",
					content: `${template}\nLesson Title: ${node_title}\nRoadmap: ${roadmapForAi}`,
				};
				conversation.messages.push(message, { role: "assistant", content: full });

				await conversation.save();
			}

			this.streamService.closeStream(conversation_id);
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}
