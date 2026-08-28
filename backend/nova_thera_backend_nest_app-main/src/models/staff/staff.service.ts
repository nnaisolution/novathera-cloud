import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { AuthInstance } from '../../authentication/auth.factory';
import { AuthConfigService } from '../../config/auth/config.service';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { SettingsService } from '../settings/settings.service';
import { StaffRepository } from './staff.repository';
import type {
  BanUserInput,
  CreateStaffInput,
  ListStaffInput,
  SelfRegisterAdminInput,
  SetPasswordInput,
  SetRoleInput,
} from './schemas/staff.schema';

/**
 * Account management on top of Better Auth's admin plugin.
 *
 * Mutations go through `authApi` rather than Prisma so that Better Auth's own
 * invariants hold — password hashing, session invalidation on ban, and its
 * internal permission check against the caller's session. The tRPC
 * `permissionProcedure` gate is a second, independent check.
 */
@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    private readonly repository: StaffRepository,
    private readonly authService: AuthService<AuthInstance>,
    private readonly authConfig: AuthConfigService,
    private readonly settings: SettingsService,
  ) {}

  private get api() {
    return this.authService.api;
  }

  private async requireUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return user;
  }

  /** Refuses actions that would lock the caller out of their own account. */
  private assertNotSelf(
    actorUserId: string,
    targetUserId: string,
    action: string,
  ) {
    if (actorUserId === targetUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `You cannot ${action} your own account`,
      });
    }
  }

  async list(input: ListStaffInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async roleCounts() {
    return this.repository.roleCounts();
  }

  async sessions(userId: string) {
    await this.requireUser(userId);
    return this.repository.findActiveSessions(userId);
  }

  /**
   * Open, unauthenticated admin registration for the admin app's /register page.
   *
   * SECURITY: this deliberately has no permission gate — anyone who can reach
   * the endpoint gets a full admin account, and therefore access to every
   * customer's health documents. It exists because the deployment requires
   * self-service admin signup. Turn it off with ADMIN_SELF_SIGNUP_ENABLED=false.
   *
   * Email verification is intentionally NOT bypassed here (unlike
   * admin-created staff, where a trusted admin has vouched for the person), so
   * the registrant must control the mailbox before the account can sign in.
   */
  async selfRegisterAdmin(
    input: SelfRegisterAdminInput,
    headers: Headers,
  ): Promise<{ id: string; email: string; requiresVerification: boolean }> {
    if (!this.authConfig.adminSelfSignupEnabled) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin self-registration is disabled',
      });
    }

    let created: { user: { id: string; email: string } };
    try {
      created = await this.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
          // Where the verification link lands once the token is accepted.
          // Without it Better Auth falls back to baseURL, dropping the new
          // admin on the API host instead of the dashboard they signed up on.
          callbackURL: `${this.authConfig.adminAppUrl}/`,
        },
        headers,
      });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not create the account');
    }

    try {
      await this.repository.promoteToAdmin(created.user.id);
    } catch {
      // The account exists but is still a customer. Say so plainly rather than
      // implying admin access that was not granted.
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'The account was created but could not be granted admin access. Contact an existing administrator.',
      });
    }

    this.logger.warn(
      `Open admin self-registration created an admin account: ${input.email}`,
    );

    return {
      id: created.user.id,
      email: created.user.email,
      requiresVerification: await this.resolveRequiresVerification(),
    };
  }

  /**
   * The effective email-verification setting, resolved the same way
   * `auth.factory` resolves it: a stored AppSetting wins over the env default.
   * Reading only the env var reports the wrong answer whenever an admin has
   * changed it in the settings UI.
   */
  private async resolveRequiresVerification(): Promise<boolean> {
    try {
      const security = await this.settings.get('security');
      const stored = (security as { requireEmailVerification?: boolean })
        ?.requireEmailVerification;
      return stored ?? this.authConfig.requireEmailVerification;
    } catch {
      return this.authConfig.requireEmailVerification;
    }
  }

  async create(input: CreateStaffInput, headers: Headers) {
    try {
      const result = await this.api.createUser({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
          role: input.role,
        },
        headers,
      });

      await this.repository.markEmailVerified(result.user.id);

      return { ...result.user, emailVerified: true };
    } catch (error) {
      throw this.toTrpcError(error, 'Could not create the account');
    }
  }

  async setRole(input: SetRoleInput, actorUserId: string, headers: Headers) {
    this.assertNotSelf(actorUserId, input.userId, 'change the role of');
    const user = await this.requireUser(input.userId);

    try {
      await this.api.setRole({
        body: { userId: input.userId, role: input.role },
        headers,
      });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not change the role');
    }

    return { previousRole: user.role, ...user, role: input.role };
  }

  async ban(input: BanUserInput, actorUserId: string, headers: Headers) {
    this.assertNotSelf(actorUserId, input.userId, 'suspend');
    const user = await this.requireUser(input.userId);

    try {
      await this.api.banUser({
        body: {
          userId: input.userId,
          banReason: input.reason,
          // Better Auth expects a duration in seconds.
          ...(input.expiresInDays
            ? { banExpiresIn: input.expiresInDays * 24 * 60 * 60 }
            : {}),
        },
        headers,
      });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not suspend the account');
    }

    return user;
  }

  async unban(userId: string, headers: Headers) {
    const user = await this.requireUser(userId);

    try {
      await this.api.unbanUser({ body: { userId }, headers });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not restore the account');
    }

    return user;
  }

  async setPassword(input: SetPasswordInput, headers: Headers) {
    const user = await this.requireUser(input.userId);

    try {
      await this.api.setUserPassword({
        body: { userId: input.userId, newPassword: input.newPassword },
        headers,
      });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not reset the password');
    }

    return user;
  }

  async revokeSession(sessionToken: string, userId: string, headers: Headers) {
    const user = await this.requireUser(userId);

    try {
      await this.api.revokeUserSession({ body: { sessionToken }, headers });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not revoke the session');
    }

    return user;
  }

  async revokeAllSessions(userId: string, headers: Headers) {
    const user = await this.requireUser(userId);

    try {
      await this.api.revokeUserSessions({ body: { userId }, headers });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not revoke the sessions');
    }

    return user;
  }

  async remove(userId: string, actorUserId: string, headers: Headers) {
    this.assertNotSelf(actorUserId, userId, 'delete');
    const user = await this.requireUser(userId);

    try {
      await this.api.removeUser({ body: { userId }, headers });
    } catch (error) {
      throw this.toTrpcError(error, 'Could not delete the account');
    }

    return user;
  }

  /** Surfaces Better Auth's own message instead of a generic 500. */
  private toTrpcError(error: unknown, fallback: string) {
    if (error instanceof TRPCError) return error;

    const message =
      error instanceof Error && error.message ? error.message : fallback;

    return new TRPCError({ code: 'BAD_REQUEST', message });
  }
}
