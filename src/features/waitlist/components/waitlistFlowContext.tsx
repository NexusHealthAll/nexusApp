import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WaitlistRole = "hospital" | "health-worker";
export type WaitlistModalStep = "role" | "hospital-form" | "health-worker-form";

export interface HospitalFormDraft {
  fullName: string;
  email: string;
  phoneNumber: string;
  hospitalName: string;
  location: string;
  roleCategory: string;
}

export interface HealthWorkerFormDraft {
  fullName: string;
  email: string;
  phoneNumber: string;
  professionalTitle: string;
  licenseNumber: string;
}

interface WaitlistFlowState {
  role: WaitlistRole | null;
  hospitalForm: HospitalFormDraft;
  healthWorkerForm: HealthWorkerFormDraft;
}

interface WaitlistFlowContextValue {
  state: WaitlistFlowState;
  modalStep: WaitlistModalStep | null;
  openJoinModal: () => void;
  setModalStep: (step: WaitlistModalStep) => void;
  closeJoinModal: () => void;
  setRole: (role: WaitlistRole | null) => void;
  updateHospitalForm: (patch: Partial<HospitalFormDraft>) => void;
  updateHealthWorkerForm: (patch: Partial<HealthWorkerFormDraft>) => void;
  resetFlow: () => void;
}

const STORAGE_KEY = "waitlist-flow-state-v1";

const defaultState: WaitlistFlowState = {
  role: null,
  hospitalForm: {
    fullName: "",
    email: "",
    phoneNumber: "",
    hospitalName: "",
    location: "",
    roleCategory: "",
  },
  healthWorkerForm: {
    fullName: "",
    email: "",
    phoneNumber: "",
    professionalTitle: "",
    licenseNumber: "",
  },
};

const WaitlistFlowContext = createContext<WaitlistFlowContextValue | null>(
  null,
);

function loadInitialState(): WaitlistFlowState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WaitlistFlowState>;

    return {
      role:
        parsed.role === "hospital" || parsed.role === "health-worker"
          ? parsed.role
          : null,
      hospitalForm: {
        ...defaultState.hospitalForm,
        ...parsed.hospitalForm,
      },
      healthWorkerForm: {
        ...defaultState.healthWorkerForm,
        ...parsed.healthWorkerForm,
      },
    };
  } catch {
    return defaultState;
  }
}

function persistState(nextState: WaitlistFlowState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function WaitlistFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WaitlistFlowState>(() =>
    loadInitialState(),
  );
  const [modalStep, setModalStepState] = useState<WaitlistModalStep | null>(
    null,
  );

  const value = useMemo<WaitlistFlowContextValue>(() => {
    return {
      state,
      modalStep,
      openJoinModal: () => {
        setModalStepState("role");
      },
      setModalStep: (step) => {
        setModalStepState(step);
      },
      closeJoinModal: () => {
        setModalStepState(null);
        setState(defaultState);

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      },
      setRole: (role) => {
        setState((previousState) => {
          const nextState = {
            ...previousState,
            role,
          };

          persistState(nextState);
          return nextState;
        });
      },
      updateHospitalForm: (patch) => {
        setState((previousState) => {
          const nextState = {
            ...previousState,
            hospitalForm: {
              ...previousState.hospitalForm,
              ...patch,
            },
          };

          persistState(nextState);
          return nextState;
        });
      },
      updateHealthWorkerForm: (patch) => {
        setState((previousState) => {
          const nextState = {
            ...previousState,
            healthWorkerForm: {
              ...previousState.healthWorkerForm,
              ...patch,
            },
          };

          persistState(nextState);
          return nextState;
        });
      },
      resetFlow: () => {
        setModalStepState(null);
        setState(defaultState);

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      },
    };
  }, [modalStep, state]);

  return (
    <WaitlistFlowContext.Provider value={value}>
      {children}
    </WaitlistFlowContext.Provider>
  );
}

// Context + its accessor hook are intentionally co-located; splitting into a
// separate file for fast-refresh purity isn't worth the indirection here.
// eslint-disable-next-line react-refresh/only-export-components
export function useWaitlistFlow() {
  const context = useContext(WaitlistFlowContext);

  if (!context) {
    throw new Error("useWaitlistFlow must be used within WaitlistFlowProvider");
  }

  return context;
}
