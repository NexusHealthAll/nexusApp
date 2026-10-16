import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Back navigation that follows the real history stack, so Back returns to
 * wherever the user actually came from. On a deep link / fresh load (no
 * in-app history) it goes to `fallback` instead of leaving the app.
 */
export function useBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, location.key, fallback]);
}
