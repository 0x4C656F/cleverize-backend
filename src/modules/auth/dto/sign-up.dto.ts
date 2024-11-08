import { IsString, IsEmail } from "class-validator";

export class SignUpDto {
	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@IsString()
	password: string;
}
