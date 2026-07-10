import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    // Scoped to the health-worker app only ("/medical-staff/") — this is a
    // single-domain SPA shared with the hospital admin persona, and per the
    // Web App Manifest spec a page is only install-eligible when its URL
    // falls within the manifest's scope, so /hospital/* never becomes
    // installable even though it shares the same index.html.
    VitePWA({
      registerType: "prompt", // never silently reload — could interrupt an active shift
      // We register manually via virtual:pwa-register/react's useRegisterSW()
      // (see useInstallPromptStore.ts) so the app can drive its own
      // update-available UI instead of the plugin's default injected script.
      injectRegister: null,
      scope: "/medical-staff/",
      includeAssets: ["logo.png", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "NexusCare Health Worker",
        short_name: "NexusCare",
        description:
          "Clinical shift marketplace and mobile care workflow for healthcare professionals.",
        start_url: "/medical-staff/dashboard",
        scope: "/medical-staff/",
        display: "standalone",
        background_color: "#eef7fb",
        theme_color: "#0f63d9",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Precache every hashed build asset (JS/CSS/fonts/etc) so a
        // previously-visited page keeps working offline.
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
        // Must point at the actually-precached document (index.html), not a
        // client-side route path like "/medical-staff/dashboard" — that URL
        // is never a real precache entry, so react-router (client-side)
        // takes over from index.html and renders the right screen for
        // whatever path was originally requested.
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/hospital/, /^\/api/],
        // Take control of the very page that triggered registration, not
        // just pages loaded after activation — otherwise a first-ever visit
        // that goes offline immediately has no SW controlling it yet.
        // Deliberately NOT combined with skipWaiting: true, which would
        // auto-activate every *future* update immediately and defeat the
        // registerType: "prompt" update-toast flow from Step 4.
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Never serve stale shift/earnings data while online — only
            // fall back to cache when the network genuinely fails.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "nexuscare-api",
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // so installability can be tested against `npm run dev`
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
