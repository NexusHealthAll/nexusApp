import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download, FileText } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { MetricCard } from "@/shared/components/ui/MetricCard";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { PATHS } from "@/routes/paths";
import { downloadCsv } from "@/shared/utils/downloadCsv";
import { HandoverService } from "../handoverService";
import type { HandoverReport, HandoverStatus } from "../types";

type ReportTab = "awaiting_review" | "in_progress" | "approved" | "all";

const statusDisplay: Record<
  HandoverStatus,
  { label: string; variant: BadgeVariant }
> = {
  awaiting_review: { label: "Awaiting Review", variant: "warning" },
  in_progress: { label: "Shift In Progress", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "error" },
};

/** Handover Reports list page per the Figma redesign. */
export function HandoverReportsPage() {
  const [reports, setReports] = useState<HandoverReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<ReportTab>("awaiting_review");

  useEffect(() => {
    let cancelled = false;
    HandoverService.getReports().then((data) => {
      if (cancelled) return;
      setReports(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () => ({
      awaiting: reports.filter((r) => r.status === "awaiting_review").length,
      inProgress: reports.filter((r) => r.status === "in_progress").length,
      approved: reports.filter((r) => r.status === "approved").length,
    }),
    [reports],
  );

  const visible = useMemo(
    () => (tab === "all" ? reports : reports.filter((r) => r.status === tab)),
    [reports, tab],
  );

  const handleExport = () =>
    downloadCsv(
      "handover-reports.csv",
      ["Report ID", "Worker", "Shift", "Department", "Submitted", "Status"],
      reports.map((r) => [
        r.reportId,
        r.workerName,
        r.shiftLabel,
        r.department,
        r.submittedLabel.replace(/^Submitted /, ""),
        statusDisplay[r.status].label,
      ]),
    );

  return (
    <div>
      <PageHeader
        title="Handover Reports"
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Handover Reports" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Awaiting Review"
          value={counts.awaiting}
          valueTone="warning"
        />
        <MetricCard label="In Progress Shifts" value={counts.inProgress} />
        <MetricCard
          label="Approved This Week"
          value={counts.approved}
          valueTone="success"
        />
        <MetricCard
          label="Avg. Review Time"
          value="—"
          sub="available once reports are reviewed"
        />
      </div>

      <UnderlineTabs<ReportTab>
        className="mt-6"
        options={[
          {
            label: `Awaiting Review (${counts.awaiting})`,
            value: "awaiting_review",
          },
          { label: "Shift In Progress", value: "in_progress" },
          { label: "Approved", value: "approved" },
          { label: "All Reports", value: "all" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Report cards */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<EmptyStateIcon icon={FileText} />}
            title="No handover reports yet"
            description="When workers complete shifts and submit their handovers, the reports show up here for review."
          />
        ) : (
          visible.map((report) => {
            const display = statusDisplay[report.status];
            return (
              <Link
                key={report.shiftId}
                to={PATHS.hospital.handoverReportDetail(report.shiftId)}
                className="block rounded-2xl border border-neutral-100 bg-white p-5 transition-shadow hover:shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <AvatarInitials
                    name={report.workerName}
                    size="md"
                    className="bg-secondary-600 font-bold text-white"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {report.workerName}
                      {report.credential ? `, ${report.credential}` : ""} ·{" "}
                      {report.shiftLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {report.department} · {report.role} ·{" "}
                      {report.submittedLabel}
                    </p>
                  </div>
                  <Badge
                    variant={display.variant}
                    className="uppercase tracking-wide"
                  >
                    {display.label}
                  </Badge>
                  <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-300" />
                </div>
                {report.executiveSummary && (
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                    {report.executiveSummary}
                  </p>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
