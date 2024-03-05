import { IsEmail, IsString } from "class-validator";

export class SignInDto {
	@IsEmail({}, { message: "Invalid email" })
	email: string;
	@IsString()
	password: string;
}
