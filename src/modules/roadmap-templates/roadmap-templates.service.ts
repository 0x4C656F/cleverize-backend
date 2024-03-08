import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { SaveTemplateObjectDto, TemplateObjectNode } from "./dto/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import { Lesson, LessonDocument } from "../lessons/schema/lesson.schema";
import { Quiz, QuizDocument } from "../quizzes/schema/quiz.schema";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { User, UserDocument } from "../users/schema/user.schema";

@Injectable()
export class RoadmapTemplatesService {
	constructor(
		@InjectModel(TemplateRoadmapNode.name)
		private readonly model: Model<TemplateRoadmapNodeDocument>,
		@InjectModel(RoadmapNode.name)
		private readonly roadmapsModel: Model<RoadmapNodeDocument>,
		@InjectModel(Lesson.name)
		private readonly lessonModel: Model<LessonDocument>,
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>,
		@InjectModel(Quiz.name)
		private readonly quizModel: Model<QuizDocument>
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

	public async copyTemplateToUser(templateRoadmapId: string, userId: string) {
		const template: TemplateRoadmapNodeDocument = await this.model
			.findById(templateRoadmapId)
			.populate({ path: "children", populate: { path: "children" } });
		if (!template) {
			throw new NotFoundException("Template not found");
		}
		const copyAndSaveNode = async (node: TemplateRoadmapNodeDocument, parentId: string) => {
			const childIds: string[] = []; // An array to hold the IDs of the current node's children.
			const childrenTitles: string[] = []; // An array to hold the titles of the current node's children.
			childrenTitles.push(node.title); // Add the current node's title to the array.
			if (node.children && node.children.length > 0) {
				for (const child of node.children) {
					const newRoadmapNode = new this.roadmapsModel({
						title: child.title,
						owner_id: userId,
						is_completed: false,
						parent_node_id: parentId,
					});

					const savedChild = await newRoadmapNode.save();
					childIds.push(savedChild._id as string); // Add the saved child's ID to the array.

					// Recursively copy this child's structure, passing savedChild._id as the new parentId.
					await copyAndSaveNode(child as TemplateRoadmapNodeDocument, savedChild._id as string);
				}

				// Update the current node to include all its children's IDs.
				await this.roadmapsModel.findByIdAndUpdate(parentId, {
					$set: { children: childIds },
				});
			} else {
				// For nodes without children, create a lesson.
				const newTestConversation = await new this.quizModel({
					title: `Quiz: ${node.title}`,
					messages: [],
					node_id: node._id as string,
					covered_material: childrenTitles,
				}).save();

				const newConversation = await new this.lessonModel({
					title: node.title,
					node_id: node._id as string,
					messages: [],
				}).save();

				await this.roadmapsModel.findByIdAndUpdate(parentId, {
					$set: {
						lesson_id: newConversation._id as string,
						quiz_id: newTestConversation._id as string,
					},
				});
			}
		};
		const savedRoot = await new this.roadmapsModel({
			owner_id: userId,
			title: template.title,
			size: template.size,
			is_completed: false,
		}).save();

		const childIds: string[] = [];
		// Start the recursive process with the template's children, using the saved root's ID as the initial parentId.
		for (const child of template.children) {
			const savedChild = await new this.roadmapsModel({
				title: child.title,
				owner_id: userId,
				is_completed: false,
				parent_node_id: savedRoot._id as string,
				children: child.children,
			}).save();
			childIds.push(savedChild._id as string);
			await copyAndSaveNode(child as TemplateRoadmapNodeDocument, savedChild._id as string);
		}
		await this.roadmapsModel.findByIdAndUpdate(savedRoot._id, {
			$set: { children: childIds },
		});
		await this.userModel.findByIdAndUpdate(userId, {
			$push: { roadmaps: savedRoot._id as Types.ObjectId },
		});
		return savedRoot;
	}
}
