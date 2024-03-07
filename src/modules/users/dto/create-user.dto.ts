import { IsString, IsEmail } from "class-validator";

export class CreateUserDto {
	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@IsString()
	password: string;
}

