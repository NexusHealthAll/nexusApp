# Nexus Care - Healthcare Management Dashboard

A modern, feature-first healthcare management system built with React, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

This project follows a **feature-first** directory structure for better scalability and maintainability:

```
src/
├── features/           # Feature-based modules
│   ├── dashboard/      # Dashboard overview and analytics
│   ├── patients/       # Patient management
│   ├── doctors/        # Doctor profiles and schedules
│   ├── appointments/   # Appointment scheduling
│   └── onboarding/     # Multi-step onboarding flow
├── layouts/            # Layout components (MainLayout, RoleLayout)
├── routes/             # Route configuration (see Routing section below)
├── shared/             # Shared components and utilities
├── types/              # TypeScript interfaces and types
└── styles/             # Global styles and design tokens
```

---

## 🗺️ Routing Architecture

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

// ✅ correct
navigate(PATHS.patient.appointments);          // "/patient/appointments"
navigate(PATHS.hospital.onboarding.legalVerification); // "/hospital/onboarding/legal-verification"

// ❌ avoid
navigate("/patient/appointments");
```

---

## 🔑 Onboarding Flow

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
    { slug: "new-step",           element: <NewStep /> },        // ← add here
    { slug: "legal-verification", element: <LegalVerificationStep /> },
    // ...
  ],
  // other roles unchanged
};
```

Step order in the array controls the navigation sequence. The first entry is always where `/onboarding` redirects.

## 🎨 Design System

- **Colors**: Healthcare-focused blues and teals with neutral grays
- **Typography**: Inter font family for clean, professional appearance
- **Components**: Composition-based, reusable UI components
- **Spacing**: Consistent 8px grid system
- **Accessibility**: WCAG-compliant components with proper semantic HTML

## 🚀 Getting Started

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

### Build for Production

```bash
pnpm build
```

## 📋 Features

### ✅ Implemented
- **Dashboard**: Overview with key metrics and quick actions
- **Patient Management**: List view with search and filtering
- **Doctor Management**: Grid view with profiles and ratings
- **Appointment Management**: Table view with status tracking
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Design System**: Comprehensive Tailwind configuration with custom tokens

### 🚧 Coming Soon
- Patient detail views and forms
- Doctor scheduling and availability
- Appointment booking flow
- Analytics and reporting
- Search and advanced filtering
- Notifications system

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📁 Key Files

- `src/types/index.ts` - TypeScript interfaces for Patient, Doctor, Appointment
- `tailwind.config.js` - Design system configuration
- `src/styles/theme.ts` - Design tokens and theme constants
- `src/layouts/MainLayout.tsx` - Main application layout
- `src/features/*/components/` - Feature-specific components

## 🔗 Backend Integration

The TypeScript interfaces in `src/types/` serve as contracts for backend API integration. Key entities:

- **Patient**: Complete patient records with medical history
- **Doctor**: Doctor profiles with specializations and availability
- **Appointment**: Appointment scheduling with status tracking

## 🎯 Development Guidelines

- Use absolute imports with `@/` prefix
- Follow composition patterns for components
- Implement proper TypeScript typing
- Use semantic HTML for accessibility
- Follow the established design system

## 📝 License

This project is private and proprietary.
