# ☕ morning-sip

A personal **morning dashboard** — the single page you pull up with your coffee to see your day at a glance: weather, GitHub activity, calendar, mail, cloud spend, todos, and the time. A draggable, resizable grid of animated, chart-rich widgets over a warm low-saturation "Mocha" theme.

> Status: **in active development** (Phase 2 of 3). See [Progress](#progress) and [Resuming work](#resuming-work) below — this README is the handoff doc so the workflow never gets cut off.

## Stack

- **React 19** + **Vite 8** + **TypeScript 6**
- **Tailwind CSS 3.4** (theme = CSS variables → Tailwind tokens)
- **react-grid-layout v2** (draggable/resizable grid; note: v2 has a rewritten API — see `CLAUDE.md`)
- **Recharts** (charts), **Framer Motion** + **lottie-react** (animation)
- **Vitest** + **React Testing Library** + **jsdom** (TDD)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  — THE typecheck/build gate
npm test           # vitest run
npm run test:watch # vitest watch
```

> ⚠️ `tsc --noEmit` is a **no-op** in this repo (project references). The real typecheck gate is `npm run build`. See `CLAUDE.md`.

## Architecture (in one breath)

Everything hangs off a **widget contract** so widgets are built independently and dropped into a registry:

- `src/data/types.ts` — `WidgetState` + `WidgetDataResult<T>` (`{state,data,error?}`), every data hook's return type.
- `src/widgets/types.ts` — `WidgetDefinition<TData>` + `defineWidget()` (type-safe registration; **always register via `defineWidget`, never `as` casts**).
- `src/widgets/registry.ts` — the array of all widgets. **Add a widget = add one `defineWidget({...})` entry**; the grid/host/layout pick it up automatically.
- Each widget = `src/widgets/<Name>/<Name>Widget.tsx` exporting a pure `<Name>View` + a `use<Name>Data()` hook. Live-vs-mock data hides behind a source in `src/data/sources/`.
- `src/components/` — `WidgetHost` (renders a widget from its def), `WidgetFrame` (card chrome + loading/empty/error), `DashboardGrid` (grid + localStorage layout persistence + reconciliation).

Full guidance for contributors/agents lives in **`CLAUDE.md`**. The design rationale and theme are in **`docs/superpowers/specs/2026-05-31-morning-dashboard-design.md`**; the task-by-task build plan is **`docs/superpowers/plans/2026-05-31-morning-dashboard.md`**.

## Widgets

| Widget | Data source | Status |
| --- | --- | --- |
| Clock | local time | ✅ done |
| Todos | localStorage | ✅ done |
| Weather | Open-Meteo (live) | ✅ done |
| GitHub | public events API (live, cached, rate-limit aware) — commit sparkline | ✅ done |
| GitHub contributions heatmap | GitHub GraphQL via dev-proxy (expanded view) | 🚧 planned (Task 2.8) |
| Calendar | mock (→ Google Calendar later) | ✅ done |
| Mail | mock (→ Gmail later) | ⏭️ next (Task 2.5) |
| GCP | mock donut chart (→ GCP Billing later) | ⏳ pending (Task 2.6) |

## GitHub token (for the contributions heatmap — not yet wired)

The full-year contribution calendar needs GitHub's GraphQL API, which requires auth. The token is kept **server-side** in a Vite dev-server proxy so it never enters the client bundle (a `VITE_`-prefixed var would be inlined into `dist/` — unsafe). When Task 2.8 lands:

```bash
cp .env.example .env
# edit .env and set GITHUB_TOKEN=<a read-only PAT with read:user scope>
```

`.env` is gitignored. The widget will fetch a local `/api/contributions` endpoint; the token stays in the dev server.

## Progress

- **Phase 0 — Scaffold & tooling:** ✅ done
- **Phase 1 — Walking skeleton** (contract + grid + live Weather widget): ✅ done
- **Phase 2 — Remaining widgets:**
  - 2.1 Clock ✅ · 2.2 Todos ✅ · 2.3 GitHub (sparkline) ✅ · 2.4 Calendar ✅
  - 2.5 Mail ⏭️ **next** · 2.6 GCP ⏳ · 2.7 manual check ⏳
  - 2.8 GitHub contributions heatmap 🚧 (added by request; dev-proxy + GraphQL + expanded view)
- **Phase 3 — Animation & interaction:** ⏳ pending
  - 3.1 AnimatedNumber · 3.2 entrance/hover motion · 3.3 ExpandOverlay (powers the heatmap's expanded view) · 3.4 AddWidgetMenu · 3.5 final verify

## Resuming work

The project is built with a **subagent-driven, test-first** workflow against the plan doc.

0. The Claude Code skills this project is built with are vendored in **`skills/`** (workflow + design/animation) — see `skills/README.md` to install them in a fresh session. The subagent role prompts that drive the build loop are in **`agents/`** — see `agents/README.md`.
1. Read `CLAUDE.md` (conventions, the RGL v2 + `npm run build` gotchas) and the plan: `docs/superpowers/plans/2026-05-31-morning-dashboard.md`.
2. The plan lists every task with full TDD steps. Pick up at the first unchecked task (currently **Task 2.5 Mail**), then 2.6, 2.8, and Phase 3.
3. Each task: write the failing test → implement → `npm run build` + `npx vitest run` green → commit (stage only the task's files; `dist/`, `node_modules/`, `.env` are gitignored).
4. Conventions per widget: pure `*View` + `use*Data()` hook + a `defineWidget` registry entry. Mirror an existing widget (Clock/Weather) for structure.

When all tasks are done: final code review, then merge `feat/morning-dashboard` → `main`.
