import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator((data: string, context: ExecutionContext) => {
	const request: Request = context.switchToHttp().getRequest();
	const cookies: Record<string, string> = request.cookies as Record<string, string>;
	return data ? cookies[data] : cookies;
});