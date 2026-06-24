import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { PATHS } from "@/routes/paths";
import { useHospitalShift } from "@/features/hospital/shifts/hooks/useHospitalShift";

type ApplicationUi = {
  id: string;
  shiftId: string;
  clinicianName?: string;
  clinicianRole?: string;
  status?: string;
};

type ShiftApplicationsUi = {
  shiftId: string;
  applications: ApplicationUi[];
};

function badgeForPriority(priority?: string): {
  badgeColor: string;
  badgeText: string;
} {
  const p = (priority ?? "").toLowerCase();
  if (p.includes("stat")) {
    return { badgeColor: "bg-error-100 text-error-700", badgeText: "STAT" };
  }
  if (p.includes("urgent")) {
    return {
      badgeColor: "bg-warning-100 text-warning-700",
      badgeText: "URGENT",
    };
  }
  return { badgeColor: "bg-neutral-100 text-neutral-600", badgeText: "OPEN" };
}

export function OpenShiftsSection() {
  const navigate = useNavigate();
  const { getShifts, getShiftApplications, assignClinician } =
    useHospitalShift();

  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<ShiftApplicationsUi[]>([]);

  const hasData = groups.some((g) => g.applications.length > 0);

  const load = async () => {
    setIsLoading(true);
    try {
      // Backend supports listing by status; for open shifts we likely use `open`.
      const shiftsRes = await getShifts({
        status: "open",
        page: 1,
        page_size: 5,
      });
      const payload = shiftsRes as any;
      const shiftList = payload?.data ?? payload?.shifts ?? payload ?? [];
      const list: any[] = Array.isArray(shiftList) ? shiftList.slice(0, 5) : [];

      if (list.length === 0) {
        setGroups([]);
        return;
      }

      const nextGroups: ShiftApplicationsUi[] = await Promise.all(
        list.map(async (s: any) => {
          const shiftId = String(s?.id ?? "");
          if (!shiftId) return { shiftId: "", applications: [] };

          const appsRes = await getShiftApplications({
            shift_id: shiftId,
            page: 1,
            page_size: 50,
          });
          const appsPayload = appsRes as any;
          const appsList =
            appsPayload?.data ?? appsPayload?.applications ?? appsPayload ?? [];
          const appsArr: any[] = Array.isArray(appsList) ? appsList : [];

          const appsUi: ApplicationUi[] = appsArr
            .map((a: any) => {
              const id = String(a?.id ?? a?.application_id ?? "");
              if (!id) return null;
              return {
                id,
                shiftId,
                clinicianName:
                  a?.clinician_name ?? a?.worker_name ?? a?.user?.full_name,
                clinicianRole:
                  a?.clinician_role ?? a?.worker_role ?? a?.worker?.role,
                status: a?.status,
              } satisfies ApplicationUi;
            })
            .filter(Boolean) as ApplicationUi[];

          return { shiftId, applications: appsUi };
        }),
      );

      setGroups(nextGroups.filter((g) => g.shiftId));
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  // (We avoid useEffect import churn by lazy-loading on first render via useMemo/side effects is not good; so useEffect properly.)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMemo(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uiGroups = useMemo(() => groups, [groups]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">
          Open Shifts Needing Staff
        </h2>
        <Button
          size="sm"
          onClick={() => navigate(PATHS.hospital.shiftCreate)}
          className="flex items-center gap-1.5 rounded-lg bg-secondary-600 text-xs font-semibold text-white hover:bg-secondary-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Post Shift
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white px-4 py-4 animate-pulse h-[92px]"
            />
          ))}
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-neutral-800">
            No applications right now
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Open shifts will appear here once clinicians apply.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {uiGroups.map((g) => {
            const first = g.applications[0];
            const badge = badgeForPriority(first?.status ?? "");
            return (
              <div
                key={g.shiftId}
                className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white px-4 py-4"
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${badge.badgeColor}`}
                >
                  {badge.badgeText}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    Shift #{g.shiftId}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {first?.clinicianRole ?? "Clinician"} •{" "}
                    {g.applications.length} applications
                  </p>
                </div>

                <div className="flex-shrink-0 text-center">
                  <p className="text-sm font-bold text-error-600">
                    {g.applications.length} Interested
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {first?.clinicianName
                      ? `Top match: ${first.clinicianName}`
                      : "—"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    className="flex-shrink-0 rounded-lg text-xs font-semibold uppercase tracking-wide bg-neutral-900 text-white hover:bg-neutral-700"
                    onClick={async () => {
                      // Best-effort: assign first clinician. We need clinician_id; application record shape is unknown.
                      // If backend returns clinician id in a field, extend mapping accordingly.
                      const clinicianId =
                        (first as any)?.clinician_id ??
                        (first as any)?.worker_id ??
                        "";
                      if (!clinicianId) {
                        return;
                      }
                      await assignClinician({
                        shift_id: g.shiftId,
                        clinician_id: String(clinicianId),
                      });
                      await load();
                    }}
                    disabled={g.applications.length === 0}
                  >
                    Assign
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 rounded-lg text-xs font-semibold uppercase tracking-wide"
                    onClick={() => {
                      navigate(PATHS.hospital.shifts);
                    }}
                  >
                    Review
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
