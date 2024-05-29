import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { SaveTemplateObjectDto, TemplateObjectNode } from "./dto/save-template-object.dto";
import { TemplateRoadmapNode, TemplateRoadmapNodeDocument } from "./roadmap-templates.schema";
import { RoadmapNodesService } from "../roadmap-nodes/roadmap-nodes.service";
import { RoadmapNodeDocument } from "../roadmap-nodes/schema/roadmap-nodes.schema";
import { RawRoadmap } from "../roadmap-nodes/types/raw-roadmap";
import { LOAD_TEMPLATE_CREDIT_COST } from "../subscriptions/subscription";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class RoadmapTemplatesService {
	constructor(
		@InjectModel(TemplateRoadmapNode.name)
		private readonly model: Model<TemplateRoadmapNodeDocument>,
		private readonly roadmapNodesService: RoadmapNodesService,
		private readonly usersService: UsersService,
		private readonly subscriptionsService: SubscriptionsService
	) {}

	public async saveTemplateObject(root: SaveTemplateObjectDto) {
		//note - it's a system function, not for public use.
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

	public async copyTemplateToUser(
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
		await this.usersService.addRoadmapId(userId, roadmap._id);
		await this.subscriptionsService.deductCredits(userId, LOAD_TEMPLATE_CREDIT_COST);
		return roadmap;
	}
}
