<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:folder-structure-rules -->

# Folder Structure

This project uses a feature-based architecture. Follow it strictly when adding any new code.

```
app/
  (public)/       ← public pages (no auth required)
  (protected)/    ← auth-gated pages
  layout.tsx
  globals.css

components/
  ui/             ← primitives only: shadcn/ui components
  shared/         ← cross-feature: Navbar, Footer, layouts, wrappers
  features/
    <feature>/    ← one folder per feature (see below)

lib/
  trpc/           ← this app's own embedded tRPC server (init, context, root router) + client
  hooks/          ← hooks used across multiple features
  stores/         ← global state (Zustand, etc.)
  utils/          ← shared utility functions

types/
  index.ts        ← global TypeScript types
```

A feature folder only includes the subfolders it needs — not every feature has all of these:

```
components/features/<feature>/
  components/     # <Feature>View and children
  hooks/          # use-<feature>.ts, wired to tRPC via useTRPC()
  trpc/           # router.ts — procedures for this feature only
  schemas/        # Zod input/output
  services/       # server-side orchestration called from the router (optional)
  context/        # feature-local React context (optional)
  utils/          # feature-only helpers
  types.ts
  index.ts        # exports the public view(s) and hooks
```

## Rules

- **New feature?** Create `components/features/<feature-name>/` with the subfolders it needs. Never dump feature code directly into `components/` root.
- **New page?** Add it under `app/(public)/` or `app/(protected)/`. The page file should only import from `components/features/` or `components/shared/` — no inline logic.
- **Reusable primitive?** Goes in `components/ui/`. It must have zero feature-specific logic.
- **Shared hook or util?** If used by more than one feature, it goes in `lib/hooks/` or `lib/utils/`. If only one feature uses it, it stays inside that feature folder.
- **Types?** Feature-local types go in `components/features/<feature>/types.ts`. Truly global types go in `types/index.ts`.
- **Cross-feature imports**: don't import one feature's internals from another (e.g. `booking` importing from `waitlist/components`). Share via `components/shared/`, `lib/`, or `types/`.
- Use the `@/` alias for all imports (e.g. `@/components/ui/button`, `@/lib/utils`).

<!-- END:folder-structure-rules -->

<!-- BEGIN:trpc-rules -->

# Data access: tRPC only

This app talks to **two** tRPC servers. Picking the right one is the first decision when adding a feature.

| | Embedded server | NestJS backend |
|---|---|---|
| Where | `lib/trpc/` (init, router) + `app/api/trpc/[trpc]/route.ts` | `nova_thera_backend_nest_app`, via `lib/trpc/nest-client.ts` |
| Client | `useTRPC()` | `useNestTrpc()` |
| Owns | Site-local concerns with no database: `contact`, `waitlist` | Everything domain: booking, shop, cart, checkout, orders, account, family members, documents, payment methods, membership |
| Types | Inferred from the local `appRouter` | Generated `types/trpc/app-router.d.ts` — see the root `CLAUDE.md` |

**Default to the Nest backend.** Anything touching a persisted domain entity belongs there, not here. Reach for the embedded server only when the work is genuinely site-local and stateless — sending an email, a marketing form — and the backend has no business owning it.

- Backend procedures live in the backend repo. Adding one there means re-running `pnpm trpc:sync` in that repo so this app's types pick it up. Do not hand-edit `types/trpc/app-router.d.ts`.
- Embedded procedures go in the owning feature's `trpc/router.ts`, registered in `lib/trpc/router.ts`.
- Do **not** add a new `app/api/<feature>/route.ts` for domain logic. Keep Route Handlers only for things that genuinely need a raw HTTP surface: Better Auth (`app/api/auth/`), webhooks, third-party callbacks.
- Client components call tRPC through a feature hook (`use-<feature>.ts` using `useTRPC()` / `useNestTrpc()` + TanStack Query) — never `fetch` directly from a component.

```tsx
// BAD — fetch in a view
export function FooView() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/foo").then(...) }, []);
}

// GOOD — hook wraps tRPC
export function useFoo() {
  const trpc = useTRPC();
  return useQuery(trpc.foo.list.queryOptions());
}
```

<!-- END:trpc-rules -->

<!-- BEGIN:ui-rules -->

# UI: shadcn + Lucide only

- Use the **shadcn MCP** before writing UI — don't guess component APIs or invent primitives. Typical flow: confirm registries → search/list items → pull an example → add via CLI if missing locally.
- Only compose screens from `@/components/ui/*` (installed shadcn/ui). No MUI, Chakra, bare Radix outside `components/ui`, Headless UI, or hand-rolled substitutes for things shadcn already provides.
- Icons come **only** from `lucide-react` (`import { ArrowRight } from "lucide-react"`). Never emoji-as-icon, Unicode symbols, `react-icons`, `@heroicons/*`, Font Awesome, or a decorative inline `<svg>` when a Lucide icon exists.
- **No emojis** anywhere in UI copy — labels, buttons, placeholders, empty states, toasts.

<!-- END:ui-rules -->

<!-- BEGIN:working-style-rules -->

# Working style

- State assumptions before implementing; if there are multiple reasonable interpretations of a request, say so instead of silently picking one.
- Write the minimum code that solves the problem — no speculative flexibility, no config options nobody asked for, no error handling for scenarios that can't occur here.
- When editing existing code, touch only what the task requires. Don't reformat or "improve" adjacent code. If you notice unrelated dead code, mention it rather than deleting it.
- For anything with a pass/fail outcome (bug fix, validation, refactor), state how you'll verify it (a test, a reproduction, before/after behavior) rather than "make it work."

<!-- END:working-style-rules -->

<!-- BEGIN:figma-skill-pointer -->

# Figma-to-code

When implementing a design from a Figma URL or `get_design_context`, use the `figma-to-code` skill first — it walks through this file's rules before touching Figma MCP output.

<!-- END:figma-skill-pointer -->
