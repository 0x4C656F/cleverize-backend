import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AddUserMessageDto } from "./dtos/add-user-message.dto";
import { InitConversationByIdDto } from "./dtos/init-conversation.dto";
import roadmapParser from "./helpers/roadmap-parser";
import generateResponse from "./logic/generate-response";
import generateAiLesson from "./logic/init-conversation";
import { formattedPrompt } from "./logic/starter-en-conversatioh";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import {
	Subroadmap,
	UserRoadmap,
	UserRoadmapDocument,
} from "../user-roadmaps/user-roadmaps.schema";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		private streamService: StreamService
	) {}

	public addUserMessage(dto: AddUserMessageDto) {
		void this.processAddUserMessageInBackground(dto);
		return "ok";
	}
	private async processAddUserMessageInBackground(dto: AddUserMessageDto) {
		const { conversationId, content, role, ownerId, userRoadmapId } = dto;
		const conversation = await this.conversationModel.findById(conversationId);
		conversation.messages.push({
			role: role,
			content: content,
		});
		let full = "";
		const completion = await generateResponse(conversation.messages);
		for await (const part of completion) {
			const text = part.choices[0].delta.content ?? ""; // 'Text' is one small piece of answer, like: 'Hello', 'I', '`', 'am' ...
			full += text; //'Full' is the full text which you build piece by piece

			this.streamService.sendData(conversationId, full); //Idk what this does), it is supposed to do some magic and stream full text
		}
		conversation.messages.push({
			role: "assistant",
			content: full,
		});
		if (full.includes("END OF CONVERSATION")) {
			const userRoadmap = await this.model.findOne({ _id: userRoadmapId, owner_id: ownerId });

			for (const subRoadmap of userRoadmap.sub_roadmap_list) {
				for (const node of subRoadmap.node_list) {
					if (node.conversation_id === conversationId) {
						node.isCompleted = true;
					}
				}
			}

			await userRoadmap.save();
		}
		await conversation.save();
		this.streamService.closeStream(conversationId);
		return "ok";
	}
	async initConversation(dto: InitConversationByIdDto) {
		const { conversationId, nodeTitle, language, userRoadmapId } = dto;

		const userRoadmap = await this.model.findById(userRoadmapId);
		const roadmapForAi: Subroadmap = roadmapParser(userRoadmap, nodeTitle);
		try {
			const conversation = await this.conversationModel.findById(conversationId);
			if (conversation.messages.length > 0) {
				return "Conversation is already initialized";
			}
			const fullAiResponse = async (): Promise<string> => {
				let fullAiResponseString: string = "";

				const completion = await generateAiLesson(
					nodeTitle,
					roadmapForAi.title,
					roadmapForAi.node_list.toString(),
					language
				);
				for await (const part of completion) {
					const chunk = part.choices[0].delta.content ?? ""; // 'Text' is one small piece of answer, like: 'Hello', 'I', '`', 'am' ...
					fullAiResponseString += chunk;

					//'Full' is the full text which you build piece by piece
					this.streamService.sendData(conversationId, fullAiResponseString); //Idk what this does), it is supposed to do some magic and stream full text
				}
				if (fullAiResponseString.length < 100) {
					await fullAiResponse();
				} else {
					return fullAiResponseString;
				}
			};
			const responseContent = await fullAiResponse();
			const message = {
				role: "system",
				content: `${formattedPrompt(language)}\nUser's tech goal: ${
					roadmapForAi.title
				} \nCurrent lesson Title: ${nodeTitle}\nRoadmap: ${roadmapForAi.node_list.toString()}`,
			};
			conversation.messages.push(message, { role: "assistant", content: responseContent });
			this.streamService.closeStream(conversationId);

			return await conversation.save();
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}

}
