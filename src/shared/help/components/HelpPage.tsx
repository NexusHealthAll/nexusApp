import { HelpCircle } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";

export function HelpPage() {
  return (
    <EmptyState
      className="h-64 bg-neutral-50"
      icon={<HelpCircle className="h-10 w-10 text-neutral-300" />}
      title="Help & Support — Coming Soon"
    />
  );
}
