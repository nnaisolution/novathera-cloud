import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { z } from 'zod';
import { MobileSessionService } from './mobile-session.service';

const bodySchema = z.object({
  linkToken: z.string().min(1),
});

@Controller('api/mobile')
export class MobileSessionController {
  constructor(private readonly mobileSessionService: MobileSessionService) {}

  // The caller has no session yet — that is the entire point of the exchange —
  // so the global AuthGuard has to stand down here.
  @AllowAnonymous()
  @Post('session-exchange')
  @HttpCode(HttpStatus.OK)
  async exchange(@Body() body: unknown, @Req() req: Request) {
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('linkToken is required');
    }

    const result = await this.mobileSessionService.exchange(
      parsed.data.linkToken,
      {
        ipAddress: req.ip ?? null,
        userAgent: req.get('user-agent') ?? null,
      },
    );

    return {
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    };
  }
}
