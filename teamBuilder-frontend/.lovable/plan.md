# Team Builder — Frontend Plan

Building the full UI per spec. Since you don't want to share the API base URL/docs yet, I'll wire all data access through a single typed client (`src/lib/api.ts`) with a `VITE_API_BASE_URL` env var. Plug your URL in later and every screen lights up. No mock backend; real fetch calls with loading/error/toast states.

Note: project is TanStack Start, so routing uses TanStack Router file-based routes (same URLs as your spec). If you truly need `react-router-dom`, say so and I'll swap, but it would mean rebuilding the router shell.

## Design system (Kinetic Obsidian)
- Update `src/styles.css` with the full token palette (surface tiers, primary magenta, secondary violet, tertiary cyan, outlines), Inter via Google Fonts link in `__root.tsx`, custom radii and typography utility classes (`display-lg`, `headline-lg`, `section-header` uppercase, `label-sm`, etc.).
- Decorative `<LuminousArcs />` component (blurred SVG gradient rings) for hero/dashboard backgrounds.
- Glass panel utility (`bg-surface-container/60 backdrop-blur-xl border border-outline-variant/40`).
- Shadcn button/input/card variants extended: `primary` (solid magenta + glow hover), `ghost-cyan` (cyan outline), `pill` chips.

## Routes (TanStack)
```
/                       Landing (guest)
/auth/login             Login
/auth/register          Register
/_authenticated/
  dashboard             Dashboard (stats, quick actions, recommended)
  skills                My Skills (add/remove)
  teams                 Browse Teams (search + grid)
  teams/matched         Matched Teams
  teams/create          Create Team
  teams/$teamId         Team Detail (+ Leader Console when owner)
  profile               Profile
```
Auth layout uses `_authenticated/route.tsx` gate that checks Zustand auth store; unauthenticated → redirect `/auth/login` with redirect-back search param.

## Shared components
- `AppSidebar` — fixed left nav, active state via `useRouterState`, collapsible on mobile.
- `TopBar` — contextual title, search, user menu.
- `SkillChip` — pill, variants: `personal` (cyan), `required` (magenta), with optional remove button.
- `TeamCard` — name, leader, vacancy count, required skill chips (truncated), action button.
- `StatCard` — large numeric + label + icon.
- `EmptyState`, `SkeletonCard`, `Toaster` (sonner).

## State
- `useAuthStore` (Zustand, persisted to localStorage): `{ token, user, login(), logout() }`.
- TanStack Query for all server data; `apiFetch()` injects `Authorization: Bearer <token>` and throws typed errors.

## API client (`src/lib/api.ts`)
Single fetch wrapper + grouped namespaces matching the spec:
- `auth.login`, `auth.register`
- `users.me`, `users.update`
- `skills.list`, `skills.add`, `skills.remove`
- `teams.list`, `teams.matched`, `teams.get`, `teams.create`, `teams.updateSkills`
- `members.request`, `members.accept`, `members.reject`
Each function returns typed data; easy to adjust once you share exact payload shapes.

## Screen behavior highlights
- **Dashboard**: 3 StatCards (skills count, matched teams count, pending requests), 4 Quick Action tiles, recommended teams strip.
- **Skills**: input + add button, grid of personal SkillChips with X to remove, confirm toast.
- **Browse**: search box (client-side filter), responsive grid of TeamCards, skeletons while loading.
- **Matched**: same grid, source is `/teams/matched`.
- **Team Detail**: header (name/leader/vacancies), mission, required skills, Join button with contextual state (Join / Pending / Member / Rejected). If `user.id === team.leaderId`, show Leader Console tabs: Edit Team, Manage Skills, Handle Requests (accept/reject by userId input per spec limitation).
- **Create Team**: form (name, mission, vacancy count, required skills builder).
- **Profile**: view/edit name/email; logout button.

## Implementation notes
- Toasts via `sonner` (already in shadcn kit).
- Skeleton loaders for every GET.
- All colors via semantic tokens — no hardcoded hex in components.
- Set `VITE_API_BASE_URL` in `.env` (placeholder); update when you share the real URL.
- Landing page: neon hero with luminous arcs, value prop cards, dual CTAs.

## Out of scope (this pass)
- Real backend, mocks, or fixtures.
- Tests.
- i18n.

Approve and I'll build it end to end.