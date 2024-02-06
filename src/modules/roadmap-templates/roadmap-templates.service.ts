import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { SaveTemplateObjectDto, TemplateObjectNode } from "./dtos/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import {
	Conversation,
	ConversationDocument,
	TemplateConversation,
	TemplateConversationDocument,
} from "../conversations/schemas/conversation.schema";
import {
	UserRoadmapNode,
	UserRoadmapNodeDocument,
} from "../user-roadmap-nodes/user-roadmap-nodes.schema";

@Injectable()
export class RoadmapTemplatesService {
	constructor(
		@InjectModel(TemplateRoadmapNode.name)
		private readonly model: Model<TemplateRoadmapNodeDocument>,
		@InjectModel(UserRoadmapNode.name)
		private readonly userRoadmapsModel: Model<UserRoadmapNodeDocument>,
		@InjectModel(TemplateConversation.name)
		private readonly conversationTemplatesModel: Model<TemplateConversationDocument>,
		@InjectModel(Conversation.name)
		private readonly conversationModel: Model<ConversationDocument>
	) {}

	public async saveTemplateObject(root: SaveTemplateObjectDto) {
		const queue: TemplateObjectNode[] = [root];

		const savedRoot = await new this.model({ title: root.title, size: root.size }).save();
		root._id = savedRoot._id as string;

		while (queue.length > 0) {
			const currentNode = queue.shift();
			const childrenIds = [];

			if (currentNode) {
				if (currentNode.children.length === 0) {
					const savedConversation = await new this.conversationTemplatesModel({
						node_title: currentNode.title,
						node_id: currentNode._id,
						messages: [],
					}).save();

					await this.model.findByIdAndUpdate(currentNode._id, {
						$set: { conversation_id: savedConversation._id as string },
					});
				} else {
					for (const child of currentNode.children) {
						const savedChild = await new this.model({ title: child.title }).save();
						child._id = savedChild._id as string;

						childrenIds.push(child._id);

						queue.push(child);
					}
				}
			}

			childrenIds.length > 0 &&
				(await this.model.findByIdAndUpdate(currentNode._id, { $set: { children: childrenIds } }));
		}
		return savedRoot;
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async copyTemplateToUserRoadmap(templateRoadmapId: string, userId: string) {
		const template = await this.model.findOne({_id:templateRoadmapId});
		console.log(template)
		if (!template) throw new NotFoundException();

		const savedRoot = await new this.userRoadmapsModel({
			owner_id: userId,
			size: template.size,
			conversation_id: undefined,
			title: template.title,
			is_completed: false,
		}).save();
		savedRoot.children = template.children as unknown as UserRoadmapNode[];

		const queue: TemplateRoadmapNode[] = [template];

		// BFS algorithm
		while (queue.length > 0) {
			const currentNode = queue.shift();
			const childrenIds = [];
``
			if (currentNode) {
				if (currentNode.children.length === 0) {
					const templateConversation = await this.conversationTemplatesModel.findOne({
						node_id: currentNode._id,
					});
					if (!templateConversation) throw new NotFoundException();
					const savedConversation = await new this.conversationModel({
						node_title: currentNode.title,
						node_id: currentNode._id,
						messages: templateConversation.messages,
					}).save();

					await this.model.findByIdAndUpdate(currentNode._id, {
						$set: { conversation_id: savedConversation._id as string },
					});
				} else {
					for (const child of currentNode.children) {
						if (!child.title) {
							throw new Error(`Child node ${child._id.toString()} does not have a title`);
						}
						const savedChild = await new this.userRoadmapsModel({
							owner_id: userId,
							conversation_id: undefined,
							title: child.title,
							is_completed: false,
						}).save();

						childrenIds.push(savedChild._id);

						savedChild.children = child.children as unknown as UserRoadmapNode[];

						queue.push(savedChild);
					}
				}

				await this.model.findByIdAndUpdate(currentNode._id, { $set: { children: childrenIds } });
			}
		}
	}
}
