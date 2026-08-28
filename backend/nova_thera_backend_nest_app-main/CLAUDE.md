# nova_thera_nest_app

Loaded in addition to the root `CLAUDE.md` when working in this directory. See the root file for cross-app context, commands, and env setup — this file only covers rules specific to this app.

## Feature folder structure

Organize by **domain**, not by technical type. Every domain feature lives under `src/models/<feature>/` with this exact shape:

```
src/models/<feature>/
  <feature>.module.ts
  <feature>.router.ts       # tRPC router factory — receives service via DI
  <feature>.service.ts      # business logic, calls repository
  <feature>.repository.ts   # all data access via PrismaService
  schemas/
    <feature>.schema.ts     # Zod input/output schemas
```

Reference example: `src/models/employees/`.

Non-domain code has its own top-level home — do not put it under `src/models/`:

| Concern | Path |
|---|---|
| Auth (better-auth instance, RBAC) | `src/authentication/` |
| Shared cross-cutting helpers/schemas | `src/common/` |
| tRPC init, context, root router | `src/trpc/` |
| External connections (DB, mail) | `src/providers/<type>/` |
| Env config | `src/config/<section>/` |
| Mail content | `src/mails/<template>/` |

## Adding a new domain feature

1. Create `src/models/<feature>/` with the five files above.
2. Register `<Feature>Module` in `TrpcModule` (`src/trpc/trpc.module.ts`) — inject the service and pass it to `createAppRouter`.
3. Add the router to `createAppRouter` in `src/trpc/app.router.ts`.
4. If the schema changed, run `pnpm prisma:generate` then `pnpm prisma:migrate`.
5. Run `pnpm trpc:sync` so the admin app picks up the new/changed types.

## Layer boundaries

- **Router** (`*.router.ts`): tRPC procedures only. Wraps a `publicProcedure` / `protectedProcedure` / `permissionProcedure(resource, action)`. No business logic, no direct Prisma access.
- **Service** (`*.service.ts`): Business logic. Calls the repository — never imports `PrismaService` directly, never touches raw Prisma outside a repository.
- **Repository** (`*.repository.ts`): The only place that talks to `PrismaService`.
- **Naming**: plural kebab-case folders (`service-categories`, not `serviceCategories` or `service_categories`).

## Anti-patterns

```ts
// BAD — feature files at src root
// src/employees.service.ts  → src/models/employees/employees.service.ts

// BAD — service calling PrismaService directly
class EmployeesService {
  constructor(private prisma: PrismaService) {}   // → inject EmployeesRepository instead
}

// BAD — REST controller for domain logic
// @Controller('employees') ...   → this API is tRPC-only; add a router instead

// BAD — shared helper living inside one feature folder
// src/models/employees/format-date.ts   → src/common/helpers/ (if used by 2+ features)
```

## This app has no REST controllers, TypeORM, migrations/seeders under `src/database/`, or `src/jobs/` — do not introduce that layout from older Nest boilerplate/training data. Data access is Prisma + repository pattern; the only API surface is tRPC.
