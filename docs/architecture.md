# Architecture

This project follows a **feature-first** directory structure for better scalability and maintainability:

```
src/
├── features/           # Feature-based modules
│   ├── auth/           # Login, signup, OTP verification, role selection
│   ├── onboarding/      # Multi-step onboarding flow (shared steps)
│   ├── hospital/        # Hospital dashboard, shifts, workers, analytics
│   ├── health-worker/   # Health-worker dashboard, active shifts, consultations
│   ├── medical-staff/   # Medical-staff routes (renders health-worker components)
│   ├── patient/         # Patient views
│   └── waitlist/        # Pre-launch landing/waitlist flow
├── layouts/            # Layout components (MainLayout, RoleLayout)
├── routes/             # Route configuration (see Routing section below)
├── shared/             # Shared components and utilities
├── lib/                # apiClient (axios instance) and ApiError
├── types/              # Small set of cross-cutting TypeScript types
└── styles/             # Global styles
```

Each `features/<domain>/` module groups its own `components/`, `hooks/`, `services/`, and `types.ts` — keep feature-specific code inside its feature folder rather than in `shared/`. Only put something in `shared/` once a second feature actually needs it.

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
    ├── patient.routes.tsx       # Page routes for /patient/*
    └── onboarding.routes.tsx    # Conditional onboarding factory
```

### URL structure

Each role lives under its own prefix:

| Role | Prefix | Default landing |
|---|---|---|
| Hospital | `/hospital` | `/hospital/dashboard` |
| Medical Staff | `/medical-staff` | `/medical-staff/dashboard` |
| Patient | `/patient` | `/patient/dashboard` |

`/` and any unknown URL redirect to `/patient/dashboard` (set via `DEFAULT_REDIRECT` in `paths.ts`).

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
// src/routes/roles/patient.routes.tsx
export const patientPageRoutes: RouteObject[] = [
  { path: "dashboard",     element: <DashboardOverview /> },
  { path: "appointments",  element: <AppointmentList /> },
  // Add your new page here:
  { path: "prescriptions", element: <Prescriptions /> },
];
```

The path is **relative** to the role prefix — no leading slash needed.

### Adding a page to all roles

Add the same entry to all three `*.routes.tsx` files. If the page component is shared, import it from `src/features/`.

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
navigate(PATHS.patient.appointments);          // "/patient/appointments"
navigate(PATHS.hospital.onboarding.legalVerification); // "/hospital/onboarding/legal-verification"

// avoid
navigate("/patient/appointments");
```

---

## Onboarding Flow

Onboarding routes are conditionally registered per role by `buildOnboardingRoutes(profile)` in `src/routes/roles/onboarding.routes.tsx`. Each role gets only the steps that apply to it:

| Role | Steps |
|---|---|
| `hospital` | registration → legal-verification → onboarding-status → verification-pending → accreditation-granted |
| `medical-staff` | registration → verification-pending → accreditation-granted |
| `patient` | registration → accreditation-granted |

Onboarding step components live in `src/features/onboarding/components/OnboardingFlow.tsx` and use `useRoleBasePath()` to navigate to the correct next step regardless of which role prefix they're rendered under.

### Adding an onboarding step

1. Create and export a new step component from `OnboardingFlow.tsx`.
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
