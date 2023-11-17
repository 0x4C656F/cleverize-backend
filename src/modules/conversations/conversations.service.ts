import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";

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
		@InjectModel(Conversation.name) private readonly chatModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		private streamService: StreamService
	) {}

	// public async addMessage(dto: AddMessageDto) {
	// 	// ... existing logic for addMessage
	// }

	async initConversation(node_title: string, user_roadmap_id: string, conversation_id: string) {
		if (!node_title) {
			throw new Error("node_title is not defined");
		}
		if (!user_roadmap_id) {
			throw new Error("user_roadmap_id is not defined");
		}
		if (!conversation_id) {
			throw new Error("conversation_id is not defined");
		}
		void this.processConversationInBackground(node_title, user_roadmap_id, conversation_id);
		return { status: "Conversation started" };
	}
	private async processConversationInBackground(
		node_title: string,
		user_roadmap_id: string,
		conversation_id: string
	) {
		// PREPARING DATA FOR AI
		const user_roadmap = await this.model.findById(user_roadmap_id);
		let user_subroadmap: Subroadmap;
		try {
			user_roadmap.sub_roadmap_list.map((subroadmap) => {
				subroadmap.node_list.map((tech) => {
					if (tech.title === node_title) {
						user_subroadmap = subroadmap;
					}
				});
			});
		} catch (error) {
			console.log(error);
		}
		//END OF PREPARING DATA FOR AI
		const openai = new OpenAI({
			apiKey: "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",
		});
		try {
			let full = "";
			const template: string =
				"You're chat bot, which teaches user given lesson. you will be provided with list of lessons and the lesson user is now on. Considering previous lessons user was learning, you will have to generate lesson to LEARN EXACT LESSON USER IS NOW ON, trying not to repeat the contents of the previous topic. You should emulate experience transfer and speak, like someone who is well-experienced in the industry.  Lesson has to be very short, concise and bound ONLY to chosen topic. Always give examples. Once you provide user with lesson - highlight key information and make sure, user understands it, by asking few questions. Once user has answered all questions correctly, ask 'Do you have any questions?',  if not - type in 'END OF CONVERSATION'.Use HTML tags for formatting: <strong> for emphasis, <ul> for unordered lists, <li> for list items, <code> for code examples, and <br> to insert line breaks";

			const completion = await openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: `${template}\nLesson Title: ${node_title}\nRoadmap: ${user_subroadmap.node_list.toString()}`,
					},
				],
				model: "gpt-3.5-turbo",
				stream: true,
			});

			for await (const part of completion) {
				const text = part.choices[0].delta.content ?? ""; // 'Text' is one small piece of answer, like: 'Hello', 'I', '`', 'am' ...
				full += text; //'Full' is the full text which you build piece by piece
				console.log(full);
				this.streamService.sendData(conversation_id, full); //Idk what this does), it is supposed to do some magic and stream full text
			}

			// After streaming ends, save the entire conversation

			const conversation = await this.chatModel.findById(conversation_id); //Saving the final text in chat
			if (conversation) {
				conversation.messages.push({ role: "assistant", content: full });
				await conversation.save();
			}
			this.streamService.closeStream(conversation_id);
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}
