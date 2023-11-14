/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable promise/always-return */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";

import { AddMessageDto } from "./dtos/add-message.dto";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly model: Model<ConversationDocument>,
		private streamService: StreamService
	) {}

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
	async initConversation(title: string, roadmap: { title: string }[], conversationId: string) {
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
						content: `${template}\nLesson Title: ${title}\nRoadmap: ${roadmap.toString()}`, // Your template and content here
					},
				],
				model: "gpt-3.5-turbo",
				stream: true,
			});
			for await (const part of completion) {
				const text = part.choices[0].delta.content ?? "";
				full += text;
				this.streamService.sendData(full); // Emit data to the stream
			}
			const chat = await this.model.findById({ _id: conversationId });
			chat.messages.push({
				role: "assistant",
				content: full,
			});
			await chat.save();
		} catch (error) {
			console.error("Error in startConversation:", error);
			throw error;
		}
	}
}
