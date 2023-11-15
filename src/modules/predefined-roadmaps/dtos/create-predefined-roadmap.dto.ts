import { ApiProperty, OmitType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

import { SubRoadmap } from "../schemas/predefined-roadmap.schema";

export class CreatePredefinedRoadmapDto {
	@IsString()
	@ApiProperty({ example: "google-oauth2|116000322186574711788" })
	public owner_id: string;

	@IsString()
	@ApiProperty({ example: "Game dev" })
	public title: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SubRoadmap)
	@ApiProperty({
		example: [
			{
				title: "Math (Probability & Statistics, Geometry, Algebra)",
				node_list: [
					"Introduction to Probability",
					"Random Variables and Distributions",
					"Introduction to Statistics",
					"Descriptive Statistics",
					"Inferential Statistics",
					"Geometry Basics",
					"Euclidean Geometry",
					"Non-Euclidean Geometry",
					"Basic Algebra",
					"Linear Algebra",
					"Quadratic Equations and Functions",
					"Exponential and Logarithmic Functions.",
				],
				isCompleted: false,
			},
			{
				title: "Physics",
				node_list: [
					"Basics of Physics: Introduction",
					"Mechanics",
					"Thermodynamics",
					"Electromagnetism",
					"Optics",
					"Quantum Physics",
					"Classic Physics Lab Experiments",
					"Particle Physics",
					"Astrophysics",
					"Modern Physics: Special and General Relativity",
					"Nuclear and Particle Physics",
					"Physical Measurements and Units.",
				],
				isCompleted: false,
			},
		],
	})
	public sub_roadmaps_list: SubRoadmap[];
}

export class CreatePredefinedRoadmapBodyDto extends OmitType(CreatePredefinedRoadmapDto, [
	"owner_id",
]) {}
