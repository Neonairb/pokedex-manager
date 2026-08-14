import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { AuthenticatedRequest } from './auth.guard';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user.sub;
  },
);