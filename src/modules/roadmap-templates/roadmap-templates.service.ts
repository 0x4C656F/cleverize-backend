import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { SaveTemplateObjectDto, TemplateObjectNode } from "./dto/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import { Lesson, LessonDocument } from "../lessons/schema/lesson.schema";
import { Quiz, QuizDocument } from "../quizzes/schema/quiz.schema";
import { RoadmapNodesService } from "../roadmap-nodes/roadmap-nodes.service";
import { RoadmapNode, RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { RawRoadmap } from "../roadmap-nodes/types/raw-roadmap";
import { LOAD_TEMPLATE_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
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
		private readonly quizModel: Model<QuizDocument>,
		private readonly roadmapNodesService: RoadmapNodesService,
		private readonly subscriptionsService: SubscriptionsService
	) {}

	public async saveTemplateObject(root: SaveTemplateObjectDto) {
		const queue: TemplateObjectNode[] = [root];

		const savedRoot = await new this.model({ title: root.title, size: root.size }).save();
		root._id = savedRoot._id.toString();

		while (queue.length > 0) {
			const currentNode = queue.shift();
			const childrenIds = [];

			if (currentNode) {
				for (const child of currentNode.children) {
					const savedChild = await new this.model({ title: child.title }).save();
					child._id = savedChild._id.toString();

					childrenIds.push(child._id);

					queue.push(child);
				}
			}

			await this.model.findByIdAndUpdate(currentNode._id, { $set: { children: childrenIds } });
		}
		return savedRoot;
	}

	public async copyTemplateToUserV2(
		templateRoadmapId: string,
		userId: string
	): Promise<RoadmapNodeDocument> {
		const template: TemplateRoadmapNodeDocument = await this.model
			.findById(templateRoadmapId)
			.populate({ path: "children", populate: { path: "children" } });
		if (!template) {
			throw new NotFoundException("Template not found");
		}
		const roadmap: RoadmapNodeDocument = await this.roadmapNodesService.saveRoadmap(
			template as RawRoadmap,
			userId,
			template.size
		);
		await this.userModel.findByIdAndUpdate(userId, {
			$push: { roadmaps: roadmap._id },
		});
		await this.subscriptionsService.deductCredits(userId, LOAD_TEMPLATE_CREDIT_COST);
		return roadmap;
	}
}
