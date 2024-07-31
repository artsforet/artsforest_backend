// src/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetOrUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
