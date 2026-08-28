import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Prisma } from 'generated/prisma/client';
import type { AuthInstance } from '../authentication/auth.factory';
import { AuthConfigService } from '../config/auth/config.service';
import { PrismaService } from '../providers/database/postgres/prisma.service';
import { verifyLinkToken } from './link-token';

export type SessionExchangeResult = {
  token: string;
  expiresAt: Date;
};

export type SessionExchangeRequestMeta = {
  ipAddress: string | null;
  userAgent: string | null;
};

/**
 * `.local` is reserved by RFC 6762 and can never be registered or delivered to,
 * so a synthetic address built on it cannot collide with a real mailbox or be
 * used to receive a password-reset link.
 */
const SYNTHETIC_EMAIL_DOMAIN = 'phone.novathera.local';

@Injectable()
export class MobileSessionService {
  private readonly logger = new Logger(MobileSessionService.name);

  constructor(
    private readonly authService: AuthService<AuthInstance>,
    private readonly authConfig: AuthConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Trades a link token, already proven against the patient API by SMS, for a
   * platform session. The returned token is accepted as
   * `Authorization: Bearer <token>` because of the bearer() plugin.
   */
  async exchange(
    linkToken: string,
    meta: SessionExchangeRequestMeta,
  ): Promise<SessionExchangeResult> {
    const secret = this.authConfig.mobileLinkSecret;
    if (!secret) {
      // Refusing loudly beats minting sessions from unverifiable tokens.
      this.logger.error(
        'MOBILE_LINK_SECRET is not configured; refusing session exchange',
      );
      throw new ServiceUnavailableException('Session exchange unavailable');
    }

    const claims = verifyLinkToken(linkToken, secret);
    if (!claims) {
      throw new UnauthorizedException('Invalid link token');
    }

    const user = await this.upsertPhoneUser(claims.patientId, claims.phoneE164);

    const ctx = await this.authService.instance.$context;
    const session = await ctx.internalAdapter.createSession(user.id, false, {
      ipAddress: meta.ipAddress ?? '',
      userAgent: meta.userAgent ?? '',
    });

    this.logger.log(`Mobile session issued for user ${user.id}`);
    return { token: session.token, expiresAt: session.expiresAt };
  }

  private async upsertPhoneUser(patientId: string, phoneE164: string) {
    const email = `${phoneE164}@${SYNTHETIC_EMAIL_DOMAIN}`;

    try {
      return await this.prisma.user.upsert({
        where: { phoneNumber: phoneE164 },
        update: { patientId },
        create: {
          id: randomUUID(),
          name: phoneE164,
          email,
          // Deliberately false: we proved control of a phone number, not of
          // this mailbox. Marking it verified would let anyone who later
          // attaches a credential to the address sign in past
          // requireEmailVerification.
          emailVerified: false,
          phoneNumber: phoneE164,
          patientId,
          role: 'customer',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Either this patient is already linked to a different phone number, or
        // the synthetic address is taken. Both need a human, not a retry.
        this.logger.warn(
          `Session exchange conflict for patient ${patientId}: ${String(error.meta?.target)}`,
        );
        throw new ConflictException('Account is already linked');
      }
      throw error;
    }
  }
}
