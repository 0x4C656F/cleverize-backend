import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export type JWTPayload = {
	sub: string;
};

export const UserPayload = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest<Request & { user: JWTPayload }>();

	return request.user;
});
