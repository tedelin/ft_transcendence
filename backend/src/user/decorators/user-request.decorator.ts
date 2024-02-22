import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
	id: number;
}

export const UserRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as User;
  },
);
