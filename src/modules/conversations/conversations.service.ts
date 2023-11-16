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
		const user_roadmap = await this.model.findById(user_roadmap_id);
		let roadmap: Subroadmap;
		if (user_roadmap) {
			roadmap = user_roadmap.sub_roadmap_list.find((subroadmap) => {
				subroadmap.node_list.includes({ title: node_title, isCompleted: false }) && subroadmap;
			});
		} else {
			throw new Error("Couldnt find user roadmap:");
		}

		const openai = new OpenAI({
			apiKey: "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",
		});

		try {
			let full = "";
			const template: string =
				"You're chat bot, which teaches user given lesson. you will be provided with list of lessons and the lesson user is now on. Considering previous lessons user was learning, you will have to generate lesson to LEARN EXACT LESSON USER IS NOW ON, trying not to repeat the contents of the previous topic. You should emulate experience transfer and speak, like someone who is well-experienced in the industry.  Lesson has to be very short, concise and bound ONLY to chosen topic. Always give examples. Once you provide user with lesson - highlight key information and make sure, user understands it, by asking few questions. Once user has answered all questions correctly, ask 'Do you have any questions?',  if not - type in 'END OF CONVERSATION'";

			const completion = await openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: `${template}\nLesson Title: ${node_title}\nRoadmap: ${roadmap.node_list.toString()}`,
					},
				],
				model: "gpt-3.5-turbo",
				stream: true,
			});

			for await (const part of completion) {
				const text = part.choices[0].delta.content ?? "";
				full += text;
				this.streamService.sendData(conversation_id, text);
			}

			// After streaming ends, save the entire conversation
			const conversation = await this.chatModel.findById(conversation_id);
			if (conversation) {
				conversation.messages.push({ role: "assistant", content: full });
				await conversation.save();
			}
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}
