import type { BetterAuthPlugin } from 'better-auth';
import { resolveSignupRole } from './signup-role';

export function signupRolePlugin(): BetterAuthPlugin {
  return {
    id: 'signup-role',
    init() {
      return {
        options: {
          databaseHooks: {
            user: {
              create: {
                before: (user, context) => {
                  const role = resolveSignupRole(user, context);

                  return Promise.resolve({
                    data: {
                      ...user,
                      role,
                    },
                  });
                },
              },
            },
          },
        },
      };
    },
  };
}
