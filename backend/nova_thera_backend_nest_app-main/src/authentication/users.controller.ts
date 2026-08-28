import { Controller, Get } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user, session: session.session };
  }
}
