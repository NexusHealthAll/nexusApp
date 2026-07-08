# Nexus Care - Healthcare Management Dashboard

A modern, feature-first healthcare management system built with React, TypeScript, and Tailwind CSS.

## Documentation

Detailed docs live in [`docs/`](./docs/):

- [`docs/architecture.md`](./docs/architecture.md) — folder structure, routing, onboarding flow, state management, backend integration conventions.
- [`docs/coding-standards.md`](./docs/coding-standards.md) — naming, TypeScript conventions, service-vs-hook guidance, formatting utilities, lint expectations.
- [`docs/components.md`](./docs/components.md) — the shared UI component library (`Button`, `Modal`, `Input`, `Select`, `Table`, etc.).
- [`docs/archive/`](./docs/archive/) — historical design/integration reports, kept for context but not guaranteed current.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for production

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Design system

- **Colors**: Healthcare-focused blues and teals with neutral grays (`tailwind.config.js`)
- **Typography**: Inter font family
- **Components**: Composition-based, reusable UI components (see `docs/components.md`)
- **Spacing**: Consistent 8px grid system
- **Accessibility**: WCAG-compliant components with proper semantic HTML

## Technology stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animation**: framer-motion
- **Routing**: React Router v6
- **State**: Zustand (client/UI state), @tanstack/react-query (lightly adopted so far)
- **Icons**: Lucide React
- **Build tool**: Vite

## Development guidelines

- Use absolute imports with the `@/` prefix.
- Follow composition patterns for components; check `src/shared/components/ui/` before hand-rolling markup.
- Use semantic HTML for accessibility.
- Keep `npm run lint` and `npx tsc --noEmit` clean.

## License

This project is private and proprietary.
