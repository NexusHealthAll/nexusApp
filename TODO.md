# Task TODO

## Refactor authentication + onboarding flow for role-based registration/login

- [x] Update `src/features/auth/store/authStore.ts` to persist role/action flow selection in Zustand and add lifecycle helpers to clear it after completion.
- [x] Refactor `src/pages/landing.tsx` into the only entry point with Role (hospital/health-worker) and Action (register/login) selectors; persist selection in Zustand and navigate accordingly.
- [ ] Update `src/features/auth/components/EmailLogin.tsx` to consult Zustand for role/action and choose correct OTP send endpoint; remove/stop relying on localStorage role.
- [ ] Update `src/features/auth/components/OtpVerify.tsx` to consult Zustand for role/action and choose correct OTP verify endpoint; implement role/action-specific redirects and clear flow tracking state after completion.
- [ ] Update any existing hospital onboarding completion redirect to go into the shared OTP login flow while preserving the active role/action context.
- [ ] Update health-worker onboarding entry after OTP verify (if routing needs adjustment).
- [ ] Add role-selection popup behavior on EmailLogin whenever role is missing from Zustand.
- [ ] Create `AUTH_FLOW_REPORT.md` documenting: route flow, state transitions, endpoint usage, and Zustand store lifecycle.
- [ ] Run build/typecheck and manually sanity-check the 4 combinations (hospital/register, hospital/login, health-worker/register, health-worker/login).

