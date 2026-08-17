import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { appRoutes } from "@/routes";
import { AppToaster } from "@/shared/components/feedback/AppToaster";
import { usePwaServiceWorker } from "@/features/health-worker/hooks/usePwaServiceWorker";
import { ThemeProvider } from "@/shared/theme/ThemeContext";

/**
 * Renders the matched route tree. Must live inside <Router> so that
 * useRoutes() has access to the routing context.
 */
function AppRoutes() {
  return useRoutes(appRoutes);
}

function App() {
  // Registered once, app-wide — its scope ("/medical-staff/", see
  // vite.config.ts) is what actually keeps hospital pages untouched, not
  // where in the tree registration happens.
  usePwaServiceWorker();

  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
        <AppToaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
