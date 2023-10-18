import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Project, ProjectSchema } from "./entity/project.schema";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
	imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])],
	providers: [ProjectsService],
	controllers: [ProjectsController],
})
export class ProjectsModule {}
