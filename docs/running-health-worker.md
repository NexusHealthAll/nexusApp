# Running the Health Worker App: Dev vs Production

The health-worker side of NexusCare is a **PWA-only experience in production**: after login, health workers must use the installed app, never the site in a browser tab. In development the same routes work in a normal browser tab so you can iterate without installing anything. This doc explains what differs between the two modes and how to run each.

## TL;DR

| | Development (`npm run dev`) | Production build |
|---|---|---|
| Browser-tab access after login | ✅ Allowed — install gate is skipped | ❌ Hard-blocked — install screen only |
| Install prompt / installability | ✅ Testable (`devOptions.enabled: true`) | ✅ |
| Service worker | Generated into `dev-dist/` | Precached build in `dist/sw.js` |
| Update toast ("New version available") | Rarely fires | Fires on new deploys |

## Development

```bash
npm run dev
```

- All health-worker routes (`/medical-staff/*`, including onboarding) render normally in the browser. The install gate (`src/features/health-worker/components/InstallGate.tsx`) checks `import.meta.env.DEV` and lets everything through in dev builds.
- The service worker still runs in dev (`devOptions.enabled: true` in `vite.config.ts`), so the **InstallPromptBanner** on the dashboard and browser installability can be tested against the dev server. Dev service-worker artifacts land in `dev-dist/` — generated output of `vite-plugin-pwa` that shouldn't be committed (add it to `.gitignore` if it isn't there yet).
- If a stale dev service worker ever serves you old code, unregister it under DevTools → Application → Service Workers and hard-reload.

## Production

```bash
npm run build     # tsc && vite build
npm run preview   # serve the production build locally
```

In a production build, every **post-login** health-worker route — the dashboard tree and the onboarding steps (profile, identity, payout, pending) — is wrapped in `InstallGate`. The gate checks whether the app is running in **standalone display mode** (`display-mode: standalone` media query, or `navigator.standalone` on iOS):

- **Installed app** → routes render normally.
- **Browser tab** → the user sees only a full-screen "Install NexusCare to continue" screen. There is deliberately **no "continue in browser" option**, on any device. The screen offers:
  - a native **Install App** button where the browser supports `beforeinstallprompt` (Chrome/Edge),
  - "Add to Home Screen" instructions on iOS Safari (which never fires that event),
  - a generic browser-menu fallback elsewhere (desktop Safari/Firefox),
  - an "Open the NexusCare app" message once the app is installed but the user is still in a tab,
  - a **Log out** link so a blocked user isn't trapped in a session.

Pre-login routes (landing, auth, hospital-side registration) are **not** gated, so users can always reach login and the install screen itself. The hospital side (`/hospital/*`) is a normal website in both modes — the PWA manifest is scoped to `/medical-staff/` so hospital routes never become installable.

### Testing the gate locally

1. `npm run build && npm run preview`
2. Log in as a health worker in a normal tab → you should hit the install screen.
3. Install the app (address-bar install icon in Chrome, or the screen's **Install App** button).
4. Open the installed app → it runs standalone and goes straight to the dashboard.

### Updates in production

The service worker is registered with `registerType: "prompt"` so a background deploy never silently reloads the page mid-shift. When a new version is deployed, the **UpdateAvailableToast** appears in the running app and the user applies the update manually via its **Refresh** button.

## Where the pieces live

| Concern | File |
|---|---|
| Install gate + install-required screen | `src/features/health-worker/components/InstallGate.tsx` |
| Dismissible in-dashboard install banner | `src/features/health-worker/components/InstallPromptBanner.tsx` |
| `beforeinstallprompt` / installed-state store | `src/features/health-worker/hooks/useInstallPromptStore.ts` |
| Service-worker registration + update store | `src/features/health-worker/hooks/usePwaServiceWorker.ts`, `usePwaUpdateStore.ts` |
| Update toast | `src/features/health-worker/components/UpdateAvailableToast.tsx` |
| PWA manifest, scope, caching, dev options | `vite.config.ts` (`VitePWA` plugin block) |
| Gate wiring into routes | `src/routes/index.tsx` |
