import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus, Printer, Sparkles } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { Modal } from "@/shared/components/ui/Modal";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Textarea } from "@/shared/components/ui/Textarea";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
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

/**
 * Full-screen handover report review (Figma "Handover" detail frames):
 * printable report card with Approve & Release Payment / Request Revision
 * wired to the real handover endpoints.
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
    if (!report) return;
    setIsApproving(true);
    try {
      await HandoverService.approve(report);
      setReport({ ...report, status: "approved" });
    } catch (err) {
      appToast.fromError(err, "Unable to approve this report");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!report || !revisionNotes.trim()) return;
    setIsSendingRevision(true);
    try {
      await HandoverService.requestRevision(report, revisionNotes.trim());
      setReport({ ...report, status: "revision_requested" });
      setRevisionOpen(false);
      appToast.success("Revision requested", "The worker has been notified.");
    } catch (err) {
      appToast.fromError(err, "Unable to request a revision");
    } finally {
      setIsSendingRevision(false);
    }
  };

  const display = report ? statusDisplay[report.status] : null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-neutral-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 print:hidden lg:px-6">
        <button
          onClick={() => navigate(PATHS.hospital.handoverReports)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-800 transition-colors hover:text-neutral-900"
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

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {isLoading ? (
          <Skeleton className="h-[560px] w-full rounded-2xl" />
        ) : !report ? (
          <EmptyState
            title="Report not found"
            description="This handover report doesn't exist or is no longer available."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft">
              {/* Report header */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-600 text-white">
                      <Plus className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-base font-bold text-neutral-900">
                        NexusCare
                      </p>
                      <p className="text-xs text-neutral-400">
                        {profile?.name ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Shift Handover Report
                    </p>
                    <p className="text-xs text-neutral-500">
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
                    <h1 className="text-2xl font-bold text-neutral-900">
                      {report.workerName}
                      {report.credential ? `, ${report.credential}` : ""}
                    </h1>
                    <p className="text-sm text-neutral-500">
                      {report.role} · {report.shiftLabel}
                    </p>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 sm:grid-cols-4">
                  {[
                    { label: "Department", value: report.department },
                    { label: "Submitted", value: report.submittedLabel },
                    {
                      label: "Patients Seen",
                      value: report.patientsSeen ?? "—",
                    },
                    {
                      label: "Tasks Completed",
                      value: report.tasksCompleted
                        ? `${report.tasksCompleted.done} of ${report.tasksCompleted.total}`
                        : "—",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white px-4 py-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-neutral-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 p-6 sm:p-8">
                {report.executiveSummary ? (
                  <>
                    {/* AI note */}
                    <div className="flex items-start gap-3 rounded-xl bg-primary-50 px-4 py-3.5">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm text-primary-800">
                        This report was generated by NexusCare AI from the
                        worker's submitted clinical notes and shift activity
                        log.
                      </p>
                    </div>

                    {[
                      {
                        title: "1. Executive Summary",
                        body: report.executiveSummary,
                      },
                      {
                        title: "2. Diagnosis & Clinical Findings",
                        body: report.clinicalFindings,
                      },
                      {
                        title: "3. Full Narrative Report",
                        body: report.narrative,
                      },
                    ]
                      .filter((section) => section.body)
                      .map((section) => (
                        <section key={section.title} className="mt-7">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
                            {section.title}
                          </h2>
                          <p className="mt-2.5 text-sm leading-relaxed text-neutral-700">
                            {section.body}
                          </p>
                        </section>
                      ))}
                  </>
                ) : (
                  <EmptyState
                    icon={<EmptyStateIcon icon={Sparkles} tone="primary" />}
                    title="Report content not available yet"
                    description="The worker's submitted handover notes will appear here once the platform exposes submitted reports to hospitals."
                  />
                )}

                <section className="mt-7">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    4. Compensation
                  </h2>
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-neutral-50 px-5 py-4">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        Amount payable to {report.workerName}
                        {report.credential ? `, ${report.credential}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Released automatically upon approval below
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {formatKobo(report.amountKobo)}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Actions / result banner */}
            {report.status === "approved" ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-success-50 px-6 py-4 text-sm font-semibold text-success-700 print:hidden">
                <Check className="h-4 w-4" />
                Report approved — payment of {formatKobo(report.amountKobo)}{" "}
                released to {report.workerName}
                {report.credential ? `, ${report.credential}` : ""}.
              </div>
            ) : report.status === "revision_requested" ? (
              <div className="mt-6 rounded-xl bg-warning-50 px-6 py-4 text-center text-sm font-semibold text-warning-700 print:hidden">
                Revision requested — the worker has been asked to update this
                report.
              </div>
            ) : (
              <div className="mt-6 grid gap-3 print:hidden sm:grid-cols-[1fr_2fr]">
                <button
                  onClick={() => setRevisionOpen(true)}
                  className="h-12 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  Request Revision
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="h-12 rounded-xl bg-success-500 text-sm font-bold text-white transition-colors hover:bg-success-600 disabled:opacity-60"
                >
                  {isApproving ? "Approving..." : "Approve & Release Payment"}
                </button>
              </div>
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
