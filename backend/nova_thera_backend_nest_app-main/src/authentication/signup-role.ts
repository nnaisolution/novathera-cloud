type AuthHookContext = {
  path?: string;
  request?: Request;
} | null;

/**
 * Self-signup always gets `customer`. Staff/admin accounts are created only via
 * the better-auth admin API (employees flow / seed scripts), which can set role
 * explicitly on the user payload.
 */
export function resolveSignupRole(
  user: Record<string, unknown>,
  context: AuthHookContext,
): string {
  if (context?.path === '/sign-up/email') {
    return 'customer';
  }

  const role = user.role;
  return typeof role === 'string' && role.length > 0 ? role : 'customer';
}
