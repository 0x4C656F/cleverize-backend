import { IsString, IsEmail } from "class-validator";

export class SignUpDto {
	@IsString()
	name: string;

	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@IsString()
	password: string;
}
