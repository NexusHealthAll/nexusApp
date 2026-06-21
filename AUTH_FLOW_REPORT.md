# Auth + Onboarding Role-Based Flow Report

## Goal
Refactor auth + onboarding to support role-based registration and login with a single entry point (landing).

## Landing (only entry point)
**Route:** `/` → `src/pages/landing.tsx`

### UI choices
- **Role:** `hospital` | `health-worker`
- **Action:** `register` | `login`

### Persisted state (Zustand)
**Store:** `src/features/auth/store/authStore.ts`
- `activeAuthFlow = { role, action, origin: 'landing' }`

### Navigation rules from Landing
- `hospital + login` → `/auth/login`
- `hospital + register` → `/hospital/onboarding/registration`
- `health-worker + login` → `/auth/login`
- `health-worker + register` → `/auth/login` (email login step first)

## OTP screens endpoint usage
OTP behavior depends on the stored `role`.

### Role: hospital
- **Send OTP:** `POST /api/v1/auth/otp/send`
- **Verify OTP:** `POST /api/v1/auth/otp/verify`

### Role: health-worker
- **Send OTP:** `POST /api/v1/clinicians/otp/send`
- **Verify OTP:** `POST /api/v1/clinicians/otp/verify`

## EmailLogin behavior (OTP send)
**Route:** `/auth/login` → `src/features/auth/components/EmailLogin.tsx`

### Store usage
- Must read `activeAuthFlow` to determine:
  - `role` (which OTP endpoints to call)
  - `action` (primarily affects post-OTP routing)

### Role missing handling
If `activeAuthFlow` is `null` (or missing role), the page should prompt the user to select role (per requirement).

### On successful OTP send
- Navigate to `/auth/verify-otp`
- Email should be persisted for OTP verify (existing implementation uses `localStorage.pendingEmail`).

## OtpVerify behavior (OTP verify)
**Route:** `/auth/verify-otp` → `src/features/auth/components/OtpVerify.tsx`

### Store usage
- Must read `activeAuthFlow.role` to choose verify endpoint.
- Must read `activeAuthFlow.action` and `activeAuthFlow.origin` to determine redirect.

### Redirect rules (expected)
- `hospital + login` → hospital dashboard (`/hospital/dashboard`)
- `hospital + register` → after OTP verify, hospital dashboard (`/hospital/dashboard`)
  - (hospital onboarding must happen before OTP verify)
- `health-worker + login` → health-worker dashboard/landing
- `health-worker + register` → proceed to health-worker onboarding after OTP verify

## Hospital onboarding lifecycle (register)
**Route:** `/hospital/onboarding/registration` and subsequent onboarding steps

### Expected behavior
- Hospital onboarding must be completed before entering OTP verify / shared login.
- The onboarding completion handler should route into the shared OTP flow while preserving `activeAuthFlow.role` and `activeAuthFlow.action`.

## Health-worker onboarding lifecycle (register)
**Expected behavior**
- For `health-worker + register`, after clinicians OTP verify succeeds,
  the app proceeds to the health-worker onboarding entry route.

## Zustand store lifecycle rules
**Requirement:** Clear all authentication flow tracking state immediately after successful registration or login completion.

### Clear point
- After the OTP verify completes successfully and final redirect is initiated,
  call:
  - `useAuthStore.getState().clearActiveAuthFlow()`

## Implementation status
- Implemented:
  - Zustand store extension with `activeAuthFlow`.
  - Landing page refactor to role/action picker.

- Not yet fully implemented (to follow up in code):
  - EmailLogin and OtpVerify migration from localStorage branching to `activeAuthFlow`.
  - Role-missing popup on EmailLogin.
  - Role/action-specific redirects for all 4 combinations.
  - Hospital onboarding completion redirect into shared OTP flow with preserved context.

## Endpoint mapping summary
| Role | Action | Send OTP | Verify OTP |
|------|--------|----------|------------|
| hospital | login | `/auth/otp/send` | `/auth/otp/verify` |
| hospital | register | `/auth/otp/send` | `/auth/otp/verify` |
| health-worker | login | `/clinicians/otp/send` | `/clinicians/otp/verify` |
| health-worker | register | `/clinicians/otp/send` | `/clinicians/otp/verify` |

