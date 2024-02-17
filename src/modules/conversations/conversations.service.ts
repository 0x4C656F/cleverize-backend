import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import getConfig, { Config } from "src/config/config";

import { AddUserMessageDto } from "./dto/add-user-message.dto";
import { InitConversationByIdDto } from "./dto/init-conversation.dto";
import getChildrenArray from "./helpers/get-children-array";
import roadmapParser from "./helpers/roadmap-parser";
import { conversationPrompt } from "./prompts/conversation-prompt";
import testPrompt from "./prompts/test-prompt";
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
	private openai: OpenAI;
	private config: Config;
	constructor(
		@InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(UserRoadmapNode.name) private readonly model: Model<UserRoadmapNodeDocument>,
		private readonly subscriptionsService: SubscriptionsService,
		private readonly streamService: StreamService
	) {
		this.config = getConfig();

		this.openai = new OpenAI({
			apiKey: this.config.openai.levApiKey,
		});
	}

	public async addUserMessage(dto: AddUserMessageDto) {
		const { conversationId, content, role, user_id } = dto;
		this.streamService.closeStream(conversationId);
		const conversation = await this.conversationModel.findById(conversationId);

		conversation.messages.push({
			role: role,
			content: content,
		});

		let completeAiResponse = "";

		const completion = await this.openai.chat.completions.create({
			messages: conversation.messages as ChatCompletionMessageParam[],
			model: "gpt-3.5-turbo-16k",
			stream: true,
			max_tokens: 2000,
		});

		for await (const part of completion) {
			const textChunk = part.choices[0].delta.content ?? "";
			completeAiResponse += textChunk;
			this.streamService.sendData(conversationId, completeAiResponse);
		}

		conversation.messages.push({
			role: "assistant",
			content: completeAiResponse,
		});

		await conversation.save();
		this.streamService.closeStream(conversationId);
		void this.subscriptionsService.deductCredits(user_id, ADD_MESSAGE_CREDIT_COST);
		return "ok";
	}

	async initConversation(dto: InitConversationByIdDto): Promise<Conversation> {
		const { conversationId, language, userRoadmapId, user_id } = dto;

		const [userRoadmap] = await this.model.find({ _id: userRoadmapId });

		try {
			const conversation = await this.conversationModel.findById(conversationId);

			if (conversation.messages.length > 0) return conversation;

			let prompt: string;
			if (conversation.test_id) {
				const childrenTitlesArray = getChildrenArray(userRoadmap);
				prompt = testPrompt(childrenTitlesArray, userRoadmap.title);
				console.log("Inited test conversation with prompt on:", conversation.test_id, prompt);
			} else {
				const roadmapForAi = roadmapParser(userRoadmap);
				prompt = conversationPrompt(
					language,
					conversation.node_title,
					roadmapForAi,
					userRoadmap.title
				);
				console.log("Inited conversation with prompt:", conversation.test_id, prompt);
			}
			const fullAiResponse = async () => {
				let fullAiResponseString: string = "";
				const completion = await this.openai.chat.completions.create({
					messages: [
						{
							role: "system",
							content: prompt,
						},
					],
					model: "gpt-3.5-turbo-1106",
					stream: true,
					max_tokens: 2000,
				});
				for await (const part of completion) {
					const chunk = part.choices[0].delta.content ?? "";
					fullAiResponseString += chunk;
					this.streamService.sendData(conversationId, fullAiResponseString);
				}
				if (fullAiResponseString.length < 100) {
					await fullAiResponse();
				} else {
					const message = {
						role: "system",
						content: prompt,
					};
					await this.model.findByIdAndUpdate(conversation.node_id, {
						$set: { is_completed: true },
					});

					conversation.messages.push(message, {
						role: "assistant",
						content: fullAiResponseString,
					});

					this.streamService.closeStream(conversationId);

					await this.subscriptionsService.deductCredits(user_id, INIT_CONVERSATION_CREDIT_COST);

					return await conversation.save();
				}
			};
			return await fullAiResponse();
		} catch (error) {
			console.error("Error in initConversation:", error);
			throw error;
		}
	}
}

//TODO + Make a test-conversation with each conversation in user-roadmap-nodes;
//TODO + Make a prompt for test-conversation;
//TODO + Add test-conversation generation to template roadmaps;
//TODO + Make check for test_id on init conversation
