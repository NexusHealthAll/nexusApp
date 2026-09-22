import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Plus,
  Printer,
  Wrench,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Textarea } from "@/shared/components/ui/Textarea";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { AttachmentGallery } from "@/shared/components/AttachmentGallery";
import { appToast } from "@/shared/components/feedback/toast";
import { PATHS } from "@/routes/paths";
import { formatKobo } from "@/shared/utils/currency";
import { useHospitalProfile } from "@/features/hospital/hooks/useHospitalProfile";
import { HandoverService } from "../handoverService";
import type { HandoverReport, HandoverStatus } from "../types";

const statusDisplay: Record<
  HandoverStatus,
  { label: string; variant: BadgeVariant }
> = {
  awaiting_review: { label: "Awaiting Review", variant: "warning" },
  in_progress: { label: "Shift In Progress", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "error" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/** Best-effort human line for a free-form critical-patient / pending-task object. */
function describeEntry(entry: Record<string, unknown>): string {
  const preferred = [
    "description",
    "summary",
    "task",
    "note",
    "notes",
    "detail",
    "details",
    "text",
    "title",
    "name",
    "label",
  ];
  for (const key of preferred) {
    const v = entry[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const firstString = Object.values(entry).find(
    (v) => typeof v === "string" && v.trim(),
  );
  if (typeof firstString === "string") return firstString.trim();
  try {
    return JSON.stringify(entry);
  } catch {
    return "—";
  }
}

/**
 * Handover report review (Figma "Handover" detail frames): printable report
 * card rendering the worker's submitted F1-H01..H05 handover (fetched from
 * `GET /api/v1/shifts/{id}/handover`), with Approve & Release Payment /
 * Request Revision wired to the real handover endpoints.
 *
 * Renders in-flow like every other hospital page (MainLayout's sidebar +
 * content), not as a full-viewport takeover — it used to be a `fixed
 * inset-0` overlay, which broke out of that layout and rendered underneath
 * the sidebar instead of beside it.
 */
export function HandoverReportDetailPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { profile } = useHospitalProfile();

  const [report, setReport] = useState<HandoverReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSendingRevision, setIsSendingRevision] = useState(false);

  useEffect(() => {
    if (!shiftId) return;
    let cancelled = false;
    HandoverService.getReport(shiftId).then((data) => {
      if (cancelled) return;
      setReport(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [shiftId]);

  const handleApprove = async () => {
    if (!report?.handover) return;
    setIsApproving(true);
    try {
      await HandoverService.approve(report);
      const approvedAt = new Date().toISOString();
      setReport({
        ...report,
        status: "approved",
        handover: { ...report.handover, hospitalApprovedAt: approvedAt },
      });
      appToast.success(
        "Handover approved",
        "Payment will be released to the worker on the next payout run.",
      );
    } catch (err) {
      appToast.fromError(err, "Unable to approve this report");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!report?.handover || !revisionNotes.trim()) return;
    setIsSendingRevision(true);
    try {
      await HandoverService.requestRevision(report, revisionNotes.trim());
      const requestedAt = new Date().toISOString();
      setReport({
        ...report,
        status: "revision_requested",
        handover: {
          ...report.handover,
          revisionRequestedAt: requestedAt,
          revisionNotes: revisionNotes.trim(),
        },
      });
      setRevisionOpen(false);
      setRevisionNotes("");
      appToast.success("Revision requested", "The worker has been notified.");
    } catch (err) {
      appToast.fromError(err, "Unable to request a revision");
    } finally {
      setIsSendingRevision(false);
    }
  };

  const display = report ? statusDisplay[report.status] : null;

  return (
    <div className="space-y-6">
      {/* Header — plain in-flow row, matching every other hospital detail
          page (e.g. ShiftApprovalPage), instead of the old sticky full-bleed
          bar that came with the fixed-overlay layout. */}
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate(PATHS.hospital.handoverReports)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Handover Reports
        </button>
        <div className="flex items-center gap-3">
          {display && (
            <Badge variant={display.variant} className="uppercase tracking-wide">
              {display.label}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Printer className="h-4 w-4" />
            Print / Export PDF
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {isLoading ? (
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        ) : !report ? (
          <EmptyState
            title="Report not found"
            description="This handover report doesn't exist or is no longer available."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
              {/* Report header */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-600 text-white">
                      <Plus className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                        NexusCare
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {profile?.name ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Shift Handover Report
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Report ID: {report.reportId}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <AvatarInitials
                    name={report.workerName}
                    className="h-14 w-14 bg-secondary-700 text-lg font-bold text-white"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                      {report.workerName}
                      {report.credential ? `, ${report.credential}` : ""}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {report.role} · {report.shiftLabel}
                    </p>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 sm:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-800">
                  {[
                    { label: "Department", value: report.department },
                    {
                      label: "Submitted",
                      value: report.handover
                        ? formatDateTime(report.handover.submittedAt)
                        : "Not submitted",
                    },
                    {
                      label: "Patients Seen",
                      value: report.handover?.patientsSeen ?? "—",
                    },
                    {
                      label: "Follow-ups",
                      value: report.handover
                        ? report.handover.criticalPatients.length
                        : "—",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white px-4 py-3.5 dark:bg-neutral-900">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 p-6 sm:p-8 dark:border-neutral-800">
                {report.handover ? (
                  <>
                    {report.handover.appealRaisedAt &&
                      !report.handover.hospitalApprovedAt && (
                        <div className="mb-4 flex items-start gap-3 rounded-xl bg-error-50 px-4 py-3.5 dark:bg-error-950">
                          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-error-600 text-white">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-error-800 dark:text-error-300">
                              Worker requested a review{" "}
                              {formatDateTime(report.handover.appealRaisedAt)}
                            </p>
                            <p className="mt-1 text-sm text-error-700 dark:text-error-400">
                              {report.handover.appealNote?.trim() ||
                                "The worker is waiting on this handover to be approved so they can be paid."}
                            </p>
                          </div>
                        </div>
                      )}

                    {report.handover.revisionRequestedAt && (
                      <div className="flex items-start gap-3 rounded-xl bg-warning-50 px-4 py-3.5 dark:bg-warning-950">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-warning-600 text-white">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
                            Revision requested{" "}
                            {formatDateTime(report.handover.revisionRequestedAt)}
                          </p>
                          {report.handover.revisionNotes && (
                            <p className="mt-1 text-sm text-warning-700 dark:text-warning-400">
                              {report.handover.revisionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <section className="mt-7">
                      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        <FileText className="h-4 w-4" />
                        1. Instructions for Incoming Staff
                      </h2>
                      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-400">
                        {report.handover.instructions}
                      </p>
                    </section>

                    <section className="mt-7">
                      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        <AlertTriangle className="h-4 w-4" />
                        2. Patients Requiring Follow-up
                      </h2>
                      {report.handover.criticalPatients.length === 0 ? (
                        <p className="mt-2.5 text-sm text-neutral-500 dark:text-neutral-500">
                          None flagged.
                        </p>
                      ) : (
                        <ul className="mt-2.5 space-y-2">
                          {report.handover.criticalPatients.map((entry, i) => (
                            <li
                              key={i}
                              className="rounded-xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              {describeEntry(entry)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="mt-7">
                      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        <ClipboardList className="h-4 w-4" />
                        3. Pending Tasks
                      </h2>
                      {report.handover.pendingTasks.length === 0 ? (
                        <p className="mt-2.5 text-sm text-neutral-500 dark:text-neutral-500">
                          No outstanding tasks.
                        </p>
                      ) : (
                        <ul className="mt-2.5 space-y-2">
                          {report.handover.pendingTasks.map((entry, i) => (
                            <li
                              key={i}
                              className="rounded-xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              {describeEntry(entry)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="mt-7">
                      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        <ImageIcon className="h-4 w-4" />
                        4. Shift Photos
                      </h2>
                      {report.handover.shiftImages.length === 0 ? (
                        <p className="mt-2.5 text-sm text-neutral-500 dark:text-neutral-500">
                          No photos attached.
                        </p>
                      ) : (
                        <AttachmentGallery
                          urls={report.handover.shiftImages}
                          imageOnly
                          className="mt-2.5"
                        />
                      )}
                    </section>

                    <section className="mt-7">
                      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        <Wrench className="h-4 w-4" />
                        5. Equipment Status
                      </h2>
                      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-400">
                        {report.handover.equipmentStatus?.trim() ||
                          "No equipment issues reported."}
                      </p>
                    </section>

                    <p className="mt-7 text-xs text-neutral-400 dark:text-neutral-500">
                      Submitted {formatDateTime(report.handover.submittedAt)}.
                      {report.handover.hospitalApprovedAt
                        ? ` Approved ${formatDateTime(
                            report.handover.hospitalApprovedAt,
                          )}.`
                        : ` Auto-approves ${formatDateTime(
                            report.handover.autoApproveAfter,
                          )} without hospital action.`}
                    </p>
                  </>
                ) : (
                  <EmptyState
                    icon={<EmptyStateIcon icon={FileText} tone="primary" />}
                    title="No handover submitted yet"
                    description="The worker's F1-H01..H05 handover will appear here once they submit it at clock-out."
                  />
                )}

                <section className="mt-7">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    6. Compensation
                  </h2>
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-neutral-50 px-5 py-4 dark:bg-neutral-800">
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        Amount payable to {report.workerName}
                        {report.credential ? `, ${report.credential}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                        Released automatically upon approval below
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                      {formatKobo(report.amountKobo)}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Actions / result banner */}
            {report.status === "approved" ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success-50 px-6 py-4 text-sm font-semibold text-success-700 print:hidden dark:bg-success-950 dark:text-success-300">
                <Check className="h-4 w-4" />
                Report approved — payment of {formatKobo(report.amountKobo)}{" "}
                released to {report.workerName}
                {report.credential ? `, ${report.credential}` : ""}.
              </div>
            ) : report.status === "in_progress" || !report.handover ? (
              <div className="mt-6 rounded-xl bg-neutral-100 px-6 py-4 text-center text-sm font-medium text-neutral-500 print:hidden dark:bg-neutral-800 dark:text-neutral-400">
                The worker hasn't submitted a handover for this shift yet — no
                actions are available.
              </div>
            ) : (
              <>
                {report.status === "revision_requested" && (
                  <div className="mt-6 rounded-xl bg-warning-50 px-6 py-4 text-center text-sm font-semibold text-warning-700 print:hidden dark:bg-warning-950 dark:text-warning-300">
                    A revision has been requested — the worker may resubmit. You
                    can still approve the current version or request another
                    revision.
                  </div>
                )}
                <div className="mt-4 grid gap-3 print:hidden sm:grid-cols-[1fr_2fr]">
                  <button
                    onClick={() => setRevisionOpen(true)}
                    disabled={isApproving || isSendingRevision}
                    className="h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isSendingRevision}
                    className="h-12 rounded-xl bg-success-500 text-sm font-bold text-white transition-colors hover:bg-success-600 disabled:opacity-60"
                  >
                    {isApproving ? "Approving..." : "Approve & Release Payment"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Revision modal */}
      <Modal
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        title="Request a revision"
        size="sm"
      >
        <div className="space-y-4">
          <Textarea
            label="What needs to change?"
            placeholder="Describe what the worker should clarify or correct..."
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevisionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand-800 hover:bg-brand-900 active:bg-brand-900"
              disabled={!revisionNotes.trim()}
              isLoading={isSendingRevision}
              onClick={handleRequestRevision}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
