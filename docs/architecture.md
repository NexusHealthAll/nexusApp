# Architecture

This project follows a **feature-first** directory structure for better scalability and maintainability:

```
src/
├── features/            # Feature-based modules — only two, one per role
│   ├── hospital/         # Hospital dashboard, shifts, workers, analytics, onboarding
│   └── health-worker/    # Health-worker dashboard, active shifts, consultations, appointments
├── layouts/             # Layout components (MainLayout, RoleLayout)
├── routes/              # Route configuration (see Routing section below)
├── shared/              # Shared components, utilities, and cross-role domains
│   ├── auth/             # Login, signup, OTP verification, role selection
│   ├── onboarding/       # Onboarding: generic steps at the root, hospital/ and
│   │                     #   health-worker/ subfolders for role-specific steps
│   ├── patients/         # Patient-records list shared by hospital + health-worker
│   ├── waitlist/         # Pre-launch landing/waitlist flow
│   └── components/ui/    # Design-system primitives (see docs/components.md)
├── lib/                 # apiClient (axios instance) and ApiError
├── types/               # Small set of cross-cutting TypeScript types
└── styles/              # Global styles
```

Each `features/<role>/` module groups its own `components/`, `hooks/`, `services/`, and `types.ts` for that role. A folder only belongs under `features/` if it's exclusive to hospital or health-worker — anything used by both (or by neither, like auth/waitlist) lives in `shared/` instead. There is no "patient" role/app in this codebase — it was scaffolded early on but never wired to a real signup path, and has been removed.

---

## Routing Architecture

Routes are fully modular and role-scoped under `src/routes/`.

```
src/routes/
├── index.tsx                    # Assembles the full RouteObject[] tree
├── paths.ts                     # Single source of truth for all URL strings
└── roles/
    ├── hospital.routes.tsx      # Page routes for /hospital/*
    ├── medical-staff.routes.tsx # Page routes for /medical-staff/*
    └── onboarding.routes.tsx    # Conditional onboarding factory
```

### URL structure

Each role lives under its own prefix:

| Role | Prefix | Default landing |
|---|---|---|
| Hospital | `/hospital` | `/hospital/dashboard` |
| Medical Staff | `/medical-staff` | `/medical-staff/dashboard` |

Any unmatched URL redirects to `/auth/login` (the catch-all `*` route in `src/routes/index.tsx`).

Within each prefix, the tree is:

```
/<role>/
├── (index)                          → redirect to ./dashboard
├── onboarding/                      → redirect to first step for that role
├── onboarding/<step>                → individual onboarding step pages
├── dashboard
├── patients
├── doctors
├── appointments
├── analytics
├── settings
└── help
```

### Adding a page to an existing role

Open the relevant file in `src/routes/roles/` and append a `RouteObject` entry:

```tsx
// src/routes/roles/hospital.routes.tsx
export const hospitalPageRoutes: RouteObject[] = [
  { path: "dashboard",     element: <DashboardOverview /> },
  { path: "patients",      element: <PatientList /> },
  // Add your new page here:
  { path: "prescriptions", element: <Prescriptions /> },
];
```

The path is **relative** to the role prefix — no leading slash needed.

### Adding a page to both roles

Add the same entry to both `hospital.routes.tsx` and `medical-staff.routes.tsx`. If the page component is shared by both roles, import it from `src/shared/` (e.g. `PatientList` lives in `src/shared/patients/components/`); if it's exclusive to one role, import it from that role's `src/features/<role>/` folder.

### Adding a new role

1. Create `src/routes/roles/<role>.routes.tsx` and export a `RouteObject[]` array.
2. Add the role to `AppProfile` in `src/types/index.ts`.
3. Call `buildRoleTree()` in `src/routes/index.tsx`:

```tsx
buildRoleTree("/new-role", "new-role", newRolePageRoutes),
```

4. Add a `buildRolePaths("/new-role")` entry to `PATHS` in `src/routes/paths.ts`.
5. Add sidebar nav items, styles, and labels for the new profile in `Sidebar.tsx`, `TopNavigation.tsx`, and `MainLayout.tsx`.

### Referencing URLs in components

Always use `PATHS` instead of hard-coded strings:

```tsx
import { PATHS } from "@/routes/paths";

// correct
navigate(PATHS.medicalStaff.earnings);          // "/medical-staff/earnings"
navigate(PATHS.hospital.onboarding.legalVerification); // "/hospital/onboarding/legal-verification"

// avoid
navigate("/medical-staff/earnings");
```

---

## Onboarding Flow

`src/shared/onboarding/` is the single home for onboarding, split three ways:

```
src/shared/onboarding/
├── components/          # Generic steps registered by onboarding.routes.tsx (below)
├── hooks/useRoleBasePath.ts
├── hospital/             # Hospital's own onboarding (registration, geofencing, identity, status)
│   ├── components/ context/ services/
└── health-worker/        # Health-worker's own onboarding (professional profile, identity, payout)
    └── components/
```

`onboarding.routes.tsx`'s `buildOnboardingRoutes(profile)` conditionally registers the generic `components/` steps per role:

| Role | Steps |
|---|---|
| `hospital` | registration → legal-verification → onboarding-status → verification-pending → accreditation-granted |
| `medical-staff` | registration → verification-pending → accreditation-granted |

Those step components use `useRoleBasePath()` to navigate to the correct next step regardless of which role prefix they're rendered under.

### Adding an onboarding step

1. Create and export a new step component in `src/shared/onboarding/components/`.
2. Add its slug to the `OnboardingSlug` union in `onboarding.routes.tsx`.
3. Add the step config to whichever role(s) need it in `profileOnboardingSteps`:

```tsx
const profileOnboardingSteps: Record<AppProfile, OnboardingStepConfig[]> = {
  hospital: [
    { slug: "registration",       element: <HospitalRegistrationStep /> },
    { slug: "new-step",           element: <NewStep /> },        // add here
    { slug: "legal-verification", element: <LegalVerificationStep /> },
    // ...
  ],
  // other roles unchanged
};
```

Step order in the array controls the navigation sequence. The first entry is always where `/onboarding` redirects.

---

## State management

- **Zustand** is the default tool for client/UI state (modal open/close, multi-step form drafts, auth session). See `src/features/*/hooks/use*Store.ts` for examples.
- **@tanstack/react-query** is installed but only lightly used so far (`src/features/medical-staff/hooks` historically, now mostly hand-rolled `useState`/`useEffect` hooks around `apiClient`). Prefer react-query for new data-fetching hooks where it fits — it isn't mandatory, but it's the more mature choice, and a growing library of hand-rolled fetch hooks should not become the default before that decision has an explicit re-check.
- Context (`createContext`/`useContext`) is reserved for multi-step form data that many sibling steps need (`OnboardingContext`, `waitlistFlowContext`) — not for server state.

## Backend integration

`src/lib/apiClient.ts` is a pre-configured axios instance (base URL from `VITE_API_BASE_URL`, automatic bearer-token injection, silent 401 refresh). Errors are normalized to a typed `ApiError` (`src/lib/apiError.ts`).

There is no local mirror of backend response shapes in `src/types/` — each feature defines its own types next to the service that calls the real endpoint (e.g. `src/features/hospital/shifts/types.ts` mirrors `nexus-backend`'s shift model directly, with a comment pointing at the live OpenAPI spec). Follow that pattern for new integrations: type the response next to the call site, not in a shared "global" types file.
