import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { UserRoadmapNode, UserRoadmapNodeDocument } from "./user-roadmap-nodes.schema";

@Injectable()
export class UserRoadmapNodesService {
	constructor(
		@InjectModel(UserRoadmapNode.name) private readonly model: Model<UserRoadmapNodeDocument>
	) {}

	public async getRoadmapNodeById(id: string) {
		const roadmapNode = await this.model.findById(id);

		if (!roadmapNode) throw new NotFoundException("Roadmap node not found");

		return roadmapNode;
	}

	public async getRoadmapSubtreeById(id: string) {
		// recursive population is enabled only on find method
		const result = await this.model.find({ _id: id });

		if (result.length === 0) throw new NotFoundException("Roadmap root not found");

		return result[0];
	}

	public async toggleRoadmapNodeCompetencyById(id: string) {
		const roadmapNode = await this.getRoadmapNodeById(id);

		roadmapNode.is_completed = !roadmapNode.is_completed;

		return await roadmapNode.save();
	}

	public async deleteRoadmapNodeById(id: string) {
		return await this.model.deleteOne({ _id: id });
	}
}
