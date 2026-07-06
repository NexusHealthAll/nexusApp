import { useState } from "react";
import { Building2, Stethoscope } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import type { AuthRole } from "@/features/auth/store/authStore";

interface RoleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (role: AuthRole) => void;
}

/**
 * Shown whenever the login flow has no role on record (e.g. the user
 * reached the login screen without going through RoleActionPicker, or a
 * page refresh dropped the in-memory activeAuthFlow). Lets them pick a role
 * without leaving the page; action is implicitly "login" since this only
 * fires from the sign-in screen.
 */
export function RoleSelectModal({
  isOpen,
  onClose,
  onSelect,
}: RoleSelectModalProps) {
  const [role, setRole] = useState<AuthRole | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select your role"
      className="max-w-lg"
    >
      <p className="mb-6 text-sm text-neutral-500">
        We need to know who's signing in before we can send your code.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole("hospital")}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            role === "hospital"
              ? "border-secondary-500 bg-secondary-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
              role === "hospital" ? "bg-secondary-100" : "bg-neutral-100"
            }`}
          >
            <Building2 className="h-5 w-5 text-neutral-700" />
          </div>
          <p className="font-bold text-neutral-900">Hospital</p>
          <p className="mt-1 text-xs text-neutral-500">
            Sign in to manage your facility.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("health-worker")}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            role === "health-worker"
              ? "border-secondary-500 bg-secondary-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
              role === "health-worker" ? "bg-secondary-100" : "bg-neutral-100"
            }`}
          >
            <Stethoscope className="h-5 w-5 text-secondary-700" />
          </div>
          <p className="font-bold text-neutral-900">Health Worker</p>
          <p className="mt-1 text-xs text-neutral-500">
            Sign in to find and manage shifts.
          </p>
        </button>
      </div>

      <Button
        onClick={() => role && onSelect(role)}
        disabled={!role}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-onboarding-primaryGreen to-onboarding-primaryBlue py-3 text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-50"
      >
        Continue
      </Button>
    </Modal>
  );
}
