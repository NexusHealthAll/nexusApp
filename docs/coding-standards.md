# Coding standards

Practical conventions this codebase actually follows, kept here so they don't have to be re-derived from scratch each time. See also `docs/architecture.md` for folder structure and `docs/components.md` for the shared UI library.

## Naming

- Components: `PascalCase.tsx` (`CreateShiftModal.tsx`).
- Hooks, services, stores, utils: `camelCase.ts` (`useHospitalShift.ts`, `shiftService.ts`, `useCreateShiftModalStore.ts`, `currency.ts`).
- One component per file, file name matches the exported component name.
- Import via the `@/` alias (`@/shared/utils/cn`), not relative `../../..` chains, except for sibling imports within the same feature folder.

## TypeScript

- `strict` mode is on, along with `noUnusedLocals`/`noUnusedParameters` — don't disable these locally.
- Avoid `any`. If a backend response shape isn't fully known, define a minimal interface covering only the fields you actually read (see `ShiftDetailsResponse` in `ShiftApprovalPage.tsx` for the pattern), or use `unknown` and narrow. Prefer that over reaching for `any` "to make the error go away."
- Type the fields you read at the call site closest to the API call, not in a shared global types file — see the "Backend integration" section in `docs/architecture.md`.

## Services vs. inline hooks — both are fine, here's when to use which

Two patterns coexist in this codebase for talking to the API, and that's intentional rather than inconsistent:

- **A `useXShift`-style hook** (e.g. `useHospitalShift.ts`) that owns `apiClient` calls directly, when the data-fetching is tightly coupled to one feature's component tree and doesn't need to be called from anywhere else.
- **A static-class service** (e.g. `HospitalMetricsService`, `HospitalOnboardingService`) when the same calls are used from multiple hooks/components, or when the logic is pure data transformation that benefits from being testable independent of React.

Pick whichever matches how the data is actually consumed — don't wrap a service in a hook or vice versa "for consistency" if the simpler option already fits.

## Adding a new shared UI primitive vs. one-off markup

Before hand-rolling markup for a dropdown, table, modal, or form field inside a feature component, check `src/shared/components/ui/` first (see `docs/components.md`) — `Select`, `Table`, `Modal`, `Input`, and `Textarea` already exist and handle the common cases (loading/empty states, keyboard nav, animation).

Add a new primitive to `src/shared/components/ui/` only once **two or more features** would use it. A single one-off form control inside a feature folder is fine and doesn't need to be promoted to `shared/` speculatively.

## Formatting utilities

- Currency: use `formatNaira`/`formatDisplayCurrency`/`formatKobo` from `@/shared/utils/currency` — don't write a new local `formatNaira`-style helper. If you have kobo, use `formatKobo`; if you already have naira, use `formatDisplayCurrency` (compact) or `formatNaira` (full control over precision/compaction).
- Dates/times: use `formatDate`/`formatTime`/`formatDateTime` from `@/shared/utils/date`, passing an `Intl.DateTimeFormatOptions` override if you need a different format than the shared default. Don't reach for `new Date(...).toLocaleDateString(...)` inline.

## Comments

- Default to no comments; code should read clearly from names and structure.
- The one place this codebase consistently *does* comment is above a service call that hits a real backend endpoint — documenting the exact route and, where relevant, the backend file/model it mirrors (see `src/features/hospital/shifts/types.ts` or `hospitalMetricsService.ts`). Keep doing this; it's genuinely load-bearing since there's no shared OpenAPI-generated client.
- If something is a known stub/mock standing in for a not-yet-built endpoint, say so in one line (see `shiftService.ts`'s `saveDraft`) rather than leaving it unexplained.

## Lint & typecheck

- `npm run lint` (ESLint, config in `.eslintrc.cjs`) and `npx tsc --noEmit` should both be clean before committing. `--max-warnings 0` means any new warning fails the script — either fix it or, if it's a deliberate, narrow exception (e.g. co-locating a context provider with its accessor hook), silence it with a one-line `eslint-disable-next-line` comment explaining why, not a blanket rule change.
- Prettier is not currently configured — match the formatting already present in the file you're editing.
