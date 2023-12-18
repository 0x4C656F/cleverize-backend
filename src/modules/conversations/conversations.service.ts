import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AddUserMessageDto } from "./dtos/add-user-message.dto";
import { InitConversationByIdDto } from "./dtos/init-conversation.dto";
import roadmapParser from "./helpers/roadmap-parser";
import { formattedPrompt } from "./logic/conversation-prompt";
import generateResponse from "./logic/generate-response";
import generateAiLesson from "./logic/init-conversation";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";
import { StreamService } from "./stream.service";
import { Expense, ExpenseDocument } from "../expenses/expenses.shema";
import { UserRoadmap, UserRoadmapDocument } from "../user-roadmaps/user-roadmaps.schema";

@Injectable()
export class ConversationsService {
	constructor(
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmap.name) private readonly model: Model<UserRoadmapDocument>,
		private streamService: StreamService,
		@InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>
	) {}

	public async addUserMessage(dto: AddUserMessageDto) {
		const { conversationId, content, role, ownerId, userRoadmapId } = dto;
		const conversation = await this.conversationModel.findById(conversationId);
		conversation.messages.push({
			role: role,
			content: content,
		});
		let fullAiResponseString = "";
		const completion = await generateResponse(conversation.messages, async (expense: Expense) => {
			await new this.expenseModel(expense).save();
		});
		for await (const part of completion) {
			const text = part.choices[0].delta.content ?? ""; // 'Text' is one small piece of answer, like: 'Hello', 'I', '`', 'am' ...
			fullAiResponseString += text; //'Full' is the full text which you build piece by piece

			this.streamService.sendData(conversationId, fullAiResponseString); //Idk what this does), it is supposed to do some magic and stream full text
		}
		conversation.messages.push({
			role: "assistant",
			content: fullAiResponseString,
		});
		if (fullAiResponseString.includes("END OF CONVERSATION")) {
			const userRoadmap = await this.model.findOne({ _id: userRoadmapId, owner_id: ownerId });
			if (!userRoadmap) {
				throw new Error("Roadmap not found");
			}
			for (const subRoadmap of userRoadmap.sub_roadmap_list) {
				for (const node of subRoadmap.node_list) {
					if (node.conversation_id.toString() === conversationId) {
						node.isCompleted = true;
						userRoadmap.markModified("sub_roadmap_list");
						await userRoadmap.save();
						break;
					}
				}
			}
		}
		await conversation.save();
		this.streamService.closeStream(conversationId);
		return "ok";
	}

	async initConversation(dto: InitConversationByIdDto): Promise<Conversation> {
		const { conversationId, language, userRoadmapId } = dto;
		const userRoadmap = await this.model.findById(userRoadmapId);
		const roadmapForAi = roadmapParser(userRoadmap);
		try {
			const conversation = await this.conversationModel.findById(conversationId);
			if (conversation.messages.length > 0) {
				return conversation;
			}

			const fullAiResponse = async () => {
				let fullAiResponseString: string = "";
				const completion = await generateAiLesson(
					conversation.node_title,
					userRoadmap.title,
					roadmapForAi,
					language,
					async (expense: Expense) => {
						await new this.expenseModel(expense).save();
					}
				);
				for await (const part of completion) {
					const chunk = part.choices[0].delta.content ?? "";
					fullAiResponseString += chunk;

					this.streamService.sendData(conversationId, fullAiResponseString);
				}
				if (fullAiResponseString.length < 100) {
					console.log("GPT failed, response to short, retrying");
					await fullAiResponse();
				} else {
					const message = {
						role: "system",
						content: formattedPrompt(
							language,
							conversation.node_title,
							roadmapForAi,
							userRoadmap.title
						),
					};
					conversation.messages.push(message, { role: "assistant", content: fullAiResponseString });
					this.streamService.closeStream(conversationId);

					return await conversation.save();
				}
			};
			await fullAiResponse();
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}
