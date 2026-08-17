import { Toaster } from "sonner";
import { useTheme } from "@/shared/theme/ThemeContext";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      theme={resolvedTheme}
      toastOptions={{ duration: 4000 }}
    />
  );
}
