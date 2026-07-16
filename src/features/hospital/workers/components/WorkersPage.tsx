import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, MessageSquare, Star, Users, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Pagination } from "@/shared/components/ui/Pagination";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { UnderlineTabs } from "@/shared/components/ui/UnderlineTabs";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { PATHS } from "@/routes/paths";
import { cn } from "@/shared/utils/cn";
import {
  WorkerDirectoryService,
  availabilityDisplay,
  type DirectoryWorker,
} from "../workerDirectoryService";

type WorkerTab = "all" | "nearby" | "recommended";

const PAGE_SIZE = 6;

const distanceOptions = [
  { value: "all", label: "Any Distance" },
  { value: "5", label: "Within 5 mi" },
  { value: "10", label: "Within 10 mi" },
];

const availabilityOptions = [
  { value: "all", label: "Any Availability" },
  { value: "now", label: "Available now" },
  { value: "on_shift", label: "On shift" },
];

const ratingOptions = [
  { value: "all", label: "Any Rating" },
  { value: "4.8", label: "4.8+" },
  { value: "4.9", label: "4.9+" },
];

/** Worker Directory page + slide-over worker profile per the Figma redesign. */
export function WorkersPage() {
  const navigate = useNavigate();
  const { workerId } = useParams<{ workerId?: string }>();

  const [workers, setWorkers] = useState<DirectoryWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<WorkerTab>("all");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [distance, setDistance] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    WorkerDirectoryService.getWorkers().then((data) => {
      if (cancelled) return;
      setWorkers(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedWorker = useMemo(
    () => workers.find((w) => w.id === workerId) ?? null,
    [workers, workerId],
  );

  const roles = useMemo(
    () => Array.from(new Set(workers.map((w) => w.role))).sort(),
    [workers],
  );

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      if (tab === "nearby" && !w.nearby) return false;
      if (tab === "recommended" && !w.recommended) return false;
      if (role !== "all" && w.role !== role) return false;
      if (distance !== "all" && w.distanceMi > Number(distance)) return false;
      if (availability === "now" && w.availability.kind !== "available_now")
        return false;
      if (availability === "on_shift" && w.availability.kind !== "on_shift")
        return false;
      if (rating !== "all" && w.rating < Number(rating)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${w.name} ${w.credential} ${w.role}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [workers, tab, role, distance, availability, rating, search]);

  useEffect(() => {
    setPage(1);
  }, [tab, role, distance, availability, rating, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openWorker = (id: string) => navigate(PATHS.hospital.workerDetail(id));
  const closeWorker = () => navigate(PATHS.hospital.workers);

  return (
    <div>
      <PageHeader
        title="Worker Directory"
        breadcrumbs={[
          { label: "Dashboard", href: PATHS.hospital.dashboard },
          { label: "Workers" },
        ]}
      />

      <UnderlineTabs<WorkerTab>
        options={[
          { label: "All Workers", value: "all" },
          { label: "Nearby Workers", value: "nearby" },
          { label: "Recommended", value: "recommended" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search workers by name or license..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="w-full sm:w-64"
        />
        <Select
          options={[
            { value: "all", label: "All Roles" },
            ...roles.map((r) => ({ value: r, label: r })),
          ]}
          value={role}
          onChange={setRole}
          containerClassName="w-40"
          className="bg-white py-2"
        />
        <Select
          options={distanceOptions}
          value={distance}
          onChange={setDistance}
          containerClassName="w-40"
          className="bg-white py-2"
        />
        <Select
          options={availabilityOptions}
          value={availability}
          onChange={setAvailability}
          containerClassName="w-44"
          className="bg-white py-2"
        />
        <Select
          options={ratingOptions}
          value={rating}
          onChange={setRating}
          containerClassName="w-36"
          className="bg-white py-2"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-100 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<EmptyStateIcon icon={Users} />}
              title={
                workers.length === 0
                  ? "No workers in your area yet"
                  : "No workers found"
              }
              description={
                workers.length === 0
                  ? "Verified healthcare professionals near your hospital will appear here as they join NexusCare."
                  : "Try a different filter or search term."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Worker</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Distance</th>
                  <th className="py-3 pr-4 font-semibold">Rating</th>
                  <th className="py-3 pr-4 font-semibold">Shifts</th>
                  <th className="py-3 pr-4 font-semibold">License</th>
                  <th className="py-3 pr-4 font-semibold">Availability</th>
                  <th className="w-24 py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((worker) => {
                  const avail = availabilityDisplay(worker.availability);
                  return (
                    <tr
                      key={worker.id}
                      onClick={() => openWorker(worker.id)}
                      className="cursor-pointer border-b border-neutral-50 transition-colors last:border-b-0 hover:bg-neutral-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarInitials
                            name={worker.name}
                            size="md"
                            className="bg-primary-700 font-bold text-white"
                          />
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {worker.name}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {worker.yearsExperience} yrs experience
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-neutral-600">
                        {worker.role}
                      </td>
                      <td className="py-4 pr-4 text-neutral-600">
                        {worker.distanceMi.toFixed(1)} mi
                      </td>
                      <td className="py-4 pr-4">
                        <span className="flex items-center gap-1 font-semibold text-neutral-900">
                          <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
                          {worker.rating}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-neutral-600">
                        {worker.shiftsDone}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={
                            worker.license === "verified"
                              ? "success"
                              : "warning"
                          }
                        >
                          {worker.license === "verified"
                            ? "Verified"
                            : "Pending"}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "py-4 pr-4 text-sm font-medium",
                          avail.className,
                        )}
                      >
                        {avail.label}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(PATHS.hospital.messages);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-600"
                            aria-label={`Message ${worker.name}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWorker(worker.id);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-600"
                            aria-label={`View ${worker.name}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-neutral-100 px-5 py-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              summary={`Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                page * PAGE_SIZE,
                filtered.length,
              )} of ${filtered.length} workers`}
            />
          </div>
        )}
      </div>

      {/* Worker profile drawer */}
      <AnimatePresence>
        {selectedWorker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeWorker}
              className="fixed inset-0 z-40 bg-neutral-900/40"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-strong"
            >
              <WorkerDrawer worker={selectedWorker} onClose={closeWorker} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkerDrawer({
  worker,
  onClose,
}: {
  worker: DirectoryWorker;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-neutral-100 p-6">
        <AvatarInitials
          name={worker.name}
          className="h-14 w-14 bg-primary-800 text-lg font-bold text-white"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-neutral-900">
            {worker.name}, {worker.credential}
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            {worker.role} • {worker.yearsExperience} yrs experience
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-sm">
            <Badge
              variant={worker.license === "verified" ? "success" : "warning"}
            >
              {worker.license === "verified" ? "Verified" : "Pending"}
            </Badge>
            <span className="flex items-center gap-1 font-semibold text-neutral-900">
              <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
              {worker.rating} ({worker.shiftsDone} shifts)
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-600"
          aria-label="Close worker profile"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Biography
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {worker.bio}
          </p>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: `${worker.acceptanceRatePct}%`,
              label: "Acceptance Rate",
            },
            {
              value: `${worker.cancellationRatePct}%`,
              label: "Cancellation Rate",
            },
            { value: `${worker.distanceMi.toFixed(1)} mi`, label: "Distance" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-neutral-50 px-3 py-4 text-center"
            >
              <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Certificates & Licenses
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {worker.certificates.map((cert) => (
              <span
                key={cert}
                className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
              >
                {cert}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Languages
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            {worker.languages.join(", ")}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Hospital History
          </h3>
          {worker.history.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">
              No previous shifts with your hospital yet.
            </p>
          ) : (
            <ul className="mt-1 divide-y divide-neutral-100">
              {worker.history.map((item) => (
                <li
                  key={`${item.shift}-${item.date}`}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-neutral-800">{item.shift}</span>
                  <span className="text-neutral-400">{item.date}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Footer actions */}
      <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 p-5">
        <button
          onClick={() => navigate(PATHS.hospital.messages)}
          className="h-11 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
        >
          Message
        </button>
        <button
          onClick={() => navigate(PATHS.hospital.createShift)}
          className="h-11 rounded-xl bg-primary-800 text-sm font-bold text-white transition-colors hover:bg-primary-900"
        >
          Invite to Shift
        </button>
      </div>
    </>
  );
}
