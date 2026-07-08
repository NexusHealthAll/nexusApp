# Shared UI components

`src/shared/components/ui/` holds this app's design-system primitives — hand-built with Tailwind (no Radix/MUI/AntD/Chakra), animated with `framer-motion` where they open/close or transition. Check here before hand-rolling markup in a feature component; see `docs/coding-standards.md` for when a new one-off control should (or shouldn't) be promoted here.

## Button

`Button.tsx` — extends all native `<button>` props.

| Prop | Type | Default |
|---|---|---|
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "danger"` | `"primary"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `isLoading` | `boolean` | `false` — shows a spinner and disables the button |

```tsx
<Button variant="outline" size="sm" isLoading={isSaving} onClick={handleSave}>
  Save
</Button>
```

## Input

`Input.tsx` — labeled text input, extends native `<input>` props.

| Prop | Type |
|---|---|
| `label` | `string` |
| `error` | `string` — renders below the field with a red border/ring; animates in/out |
| `hint` | `string` — renders below the field when there's no error |
| `leftIcon` / `rightIcon` | `LucideIcon` |
| `containerClassName` | `string` |

```tsx
<Input label="Email" required leftIcon={Mail} error={errors.email} value={email} onChange={(e) => setEmail(e.target.value)} />
```

## Textarea

`Textarea.tsx` — same `label`/`error`/`hint`/`containerClassName` contract as `Input`, wraps a native `<textarea>` (`rows` defaults to 4).

## Select

`Select.tsx` — animated form value-picker, replaces a native `<select>` + manual chevron. Built on `Dropdown`.

| Prop | Type |
|---|---|
| `options` | `{ value: string; label: string; disabled?: boolean }[]` |
| `value` | `string` |
| `onChange` | `(value: string) => void` |
| `label`, `placeholder`, `error`, `hint`, `required`, `disabled` | as on `Input` |

Keyboard support: Arrow Up/Down to move the highlighted option, Enter/Space to select, Escape to close.

```tsx
<Select
  label="Role Needed"
  required
  value={data.roleNeeded}
  onChange={(value) => onUpdate({ roleNeeded: value })}
  options={ROLES.map((role) => ({ value: role, label: role }))}
/>
```

## Dropdown

`Dropdown.tsx` — the lower-level primitive `Select` is built on. Use this directly for action menus (not single-value form pickers).

| Prop | Type |
|---|---|
| `trigger` | `ReactNode` |
| `children` | `ReactNode` — typically a list of `DropdownItem` |
| `align` | `"left" \| "right"` |
| `open` / `onOpenChange` | controlled-mode override; omit for uncontrolled |
| `triggerProps` | `ButtonHTMLAttributes` passthrough to the trigger `<button>` (e.g. for custom `onKeyDown`) |

Also exports `DropdownItem` (`active`, `destructive` boolean props) for menu rows.

## Table

`Table.tsx` — generic data table.

| Prop | Type |
|---|---|
| `columns` | `TableColumn<T>[]` — `{ key, header, render: (row: T) => ReactNode, className?, headerClassName? }` |
| `data` | `T[]` |
| `keyExtractor` | `(row: T) => string` |
| `isLoading` | `boolean` — renders skeleton rows |
| `skeletonRows` | `number`, default `5` |
| `emptyState` | `ReactNode` |
| `onRowClick` | `(row: T) => void` |

Rows animate in with a staggered fade/slide on mount or when `data` changes. Row *removal* (e.g. filtering) intentionally has no exit animation — `AnimatePresence` unmount timing inside `<table>`/`<tbody>` is a known layout-breaking combination in framer-motion.

```tsx
<Table
  columns={workerColumns}
  data={filteredWorkers}
  keyExtractor={(w) => w.id}
  isLoading={isLoading}
  emptyState={<p>No workers found</p>}
/>
```

## Modal

`Modal.tsx` — centered overlay dialog with a fade/scale enter-exit transition.

| Prop | Type | Default |
|---|---|---|
| `isOpen` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"lg"` |
| `className` | `string` | — |

Closes on Escape or backdrop click; locks body scroll while open.

## Card

`Card.tsx` (+ `CardHeader`, `CardTitle`, `CardContent` — see the file) — `variant?: "default" | "outlined" | "elevated"`.

## Badge

`Badge.tsx` — `variant?: "success" | "warning" | "error" | "info" | "neutral"`.

## AvatarInitials

`AvatarInitials.tsx` — `{ name, imageUrl?, size?: "sm" | "md" }`. Derives initials from `name`, stripping common titles (`Dr.`, `Nurse`, `Pharm.`).

## FilterTabs

`FilterTabs.tsx` — generic segmented control. `{ options: { label, value }[], value, onChange }`.

## SearchInput

`SearchInput.tsx` — `<input>` with a leading search icon, extends native `<input>` props plus `containerClassName`.

## Skeleton

`Skeleton.tsx` — a single pulsing placeholder `<div>`; also exports `DashboardSkeleton`, a composed full-page loading skeleton.

## StatCard

`StatCard.tsx` — `{ icon, value, label, sublabel?, trend?: { direction: "up" | "down", label }, tone?: "secondary" | "primary" }`.

## StepTracker / NexusCareLogo

Onboarding-specific: `StepTracker` renders the 4-step onboarding progress bar; `NexusCareLogo` renders the app logo at `size?: "sm" | "md" | "lg" | "xl"`.
