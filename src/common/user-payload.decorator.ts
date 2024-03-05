import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export type JWTPayload = {
	sub: string;
	email: string;
	name: string;
};

export const getUserPayload = (context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest<Request & { user: JWTPayload }>();

	return request.user;
};

export const UserPayload = createParamDecorator((_data: unknown, context: ExecutionContext) =>
	getUserPayload(context)
);
