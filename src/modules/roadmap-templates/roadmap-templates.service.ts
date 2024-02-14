import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { SaveTemplateObjectDto, TemplateObjectNode } from "./dto/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import { Conversation, ConversationDocument } from "../conversations/schemas/conversation.schema";
import { User, UserDocument } from "../user/schema/user.schema";
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
		@InjectModel(Conversation.name)
		private readonly conversationModel: Model<ConversationDocument>,
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>
	) {}

	public async saveTemplateObject(root: SaveTemplateObjectDto) {
		const queue: TemplateObjectNode[] = [root];

		const savedRoot = await new this.model({ title: root.title, size: root.size }).save();
		root._id = savedRoot._id as string;

		while (queue.length > 0) {
			const currentNode = queue.shift();
			const childrenIds = [];

			if (currentNode) {
				for (const child of currentNode.children) {
					const savedChild = await new this.model({ title: child.title }).save();
					child._id = savedChild._id as string;

					childrenIds.push(child._id);

					queue.push(child);
				}
			}

			await this.model.findByIdAndUpdate(currentNode._id, { $set: { children: childrenIds } });
		}
		return savedRoot;
	}

	public async copyTemplateToUserRoadmap(templateRoadmapId: string, userId: string) {
		const template: TemplateRoadmapNodeDocument = await this.model
			.findById(templateRoadmapId)
			.populate({ path: "children", populate: { path: "children" } });
		if (!template) {
			throw new NotFoundException("Template not found");
		}
		const copyAndSaveNode = async (node: TemplateRoadmapNodeDocument, parentId: string) => {
			const childIds: string[] = []; // Initialize an array to hold the IDs of the current node's children.

			if (node.children && node.children.length > 0) {
				for (const child of node.children) {
					const newUserRoadmapNode = new this.userRoadmapsModel({
						title: child.title,
						owner_id: userId,
						is_completed: false,
						parent_node_id: parentId, // This ensures the link to its immediate parent.
					});

					const savedChild = await newUserRoadmapNode.save();
					childIds.push(savedChild._id as string); // Add the saved child's ID to the array.

					// Recursively copy this child's structure, passing savedChild._id as the new parentId.
					await copyAndSaveNode(child as TemplateRoadmapNodeDocument, savedChild._id as string);
				}

				// Update the current node to include all its children's IDs.
				await this.userRoadmapsModel.findByIdAndUpdate(parentId, {
					$set: { children: childIds },
				});
			} else {
				// For nodes without children, create a conversation.
				const newConversation = await new this.conversationModel({
					node_title: node.title,
					node_id: node._id as string,
					messages: [],
					owner_id: userId,
				}).save();

				// Link the node with the created conversation. This should be the leaf node logic.
				await this.userRoadmapsModel.findByIdAndUpdate(parentId, {
					$set: { conversation_id: newConversation._id as string },
				});
			}
		};
		const savedRoot = await new this.userRoadmapsModel({
			owner_id: userId,
			title: template.title,
			size: template.size,
			is_completed: false,
		}).save();

		const childIds: string[] = [];
		// Start the recursive process with the template's children, using the saved root's ID as the initial parentId.
		for (const child of template.children) {
			const savedChild = await new this.userRoadmapsModel({
				title: child.title,
				owner_id: userId,
				is_completed: false,
				parent_node_id: savedRoot._id as string,
				children: child.children,
			}).save();
			childIds.push(savedChild._id as string);
			await copyAndSaveNode(child as TemplateRoadmapNodeDocument, savedChild._id as string);
		}
		await this.userRoadmapsModel.findByIdAndUpdate(savedRoot._id, {
			$set: { children: childIds },
		});
		await this.userModel.updateOne(
			{ user_id: userId },
			{ $push: { roadmaps: savedRoot._id as Types.ObjectId } }
		);
		return savedRoot;
	}
}
