import { createParamDecorator } from "@nestjs/common";

export type JWTPayload = {
	sub: string;
};

export const UserPayload = createParamDecorator(
	(_data, request: Request & { user: JWTPayload }) => {
		return request.user;
	}
);
