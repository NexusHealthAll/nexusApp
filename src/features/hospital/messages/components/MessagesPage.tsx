import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Mic, Paperclip, Send, Star } from "lucide-react";
import { EmptyState, EmptyStateIcon } from "@/shared/components/ui/EmptyState";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { AvatarInitials } from "@/shared/components/ui/AvatarInitials";
import { PATHS } from "@/routes/paths";
import { cn } from "@/shared/utils/cn";
import { useMessagesStore } from "../messagesStore";

const avatarPalette = [
  "bg-primary-800",
  "bg-secondary-500",
  "bg-secondary-700",
  "bg-secondary-400",
  "bg-primary-600",
  "bg-success-600",
];

/** Three-pane Messages page (mock chat store) per the Figma redesign. */
export function MessagesPage() {
  const navigate = useNavigate();
  const conversations = useMessagesStore((s) => s.conversations);
  const activeId = useMessagesStore((s) => s.activeId);
  const setActive = useMessagesStore((s) => s.setActive);
  const send = useMessagesStore((s) => s.send);

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  );

  const visibleConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    send(active.id, draft.trim());
    setDraft("");
  };

  const paletteFor = (id: string) =>
    avatarPalette[
      Math.abs(id.split("").reduce((n, ch) => n + ch.charCodeAt(0), 0)) %
        avatarPalette.length
    ];

  return (
    // Escape MainLayout's padded container so the chat panes fill the viewport.
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col lg:-m-8">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-base font-bold text-neutral-900">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-white p-6">
          <EmptyState
            icon={<EmptyStateIcon icon={MessageSquare} tone="primary" />}
            title="No conversations yet"
            description="Message a worker from the directory and your conversations will show up here."
            action={
              <Link
                to={PATHS.hospital.workers}
                className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Browse Workers
              </Link>
            }
            className="w-full max-w-md border-0"
          />
        </div>
      ) : (
      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <div className="flex w-72 flex-shrink-0 flex-col border-r border-neutral-200 bg-white">
          <div className="p-4">
            <SearchInput
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visibleConversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === active?.id;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setActive(conversation.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-neutral-50 px-4 py-3.5 text-left transition-colors",
                    isActive ? "bg-primary-50/60" : "hover:bg-neutral-50",
                  )}
                >
                  <AvatarInitials
                    name={conversation.name}
                    size="md"
                    className={cn(
                      "font-bold text-white",
                      paletteFor(conversation.id),
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-bold text-neutral-900">
                        {conversation.name}
                      </p>
                      <span className="flex-shrink-0 text-[11px] text-neutral-400">
                        {conversation.lastTime}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-neutral-500">
                        {lastMessage?.text}
                      </p>
                      {conversation.unread && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        {active && (
          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-3.5">
              <AvatarInitials
                name={active.name}
                size="md"
                className={cn("font-bold text-white", paletteFor(active.id))}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-neutral-900">
                  {active.name}
                </p>
                <p className="text-xs text-success-600">{active.presence}</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-neutral-50/40 p-5">
              {active.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.fromMe ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.fromMe
                        ? "rounded-br-md bg-primary-800 text-white"
                        : "rounded-bl-md border border-neutral-100 bg-white text-neutral-800",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-neutral-200 p-4"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
                <Paperclip className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <Mic className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              </div>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-800 text-white transition-colors hover:bg-primary-900 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Contact panel */}
        {active && (
          <div className="hidden w-72 flex-shrink-0 flex-col border-l border-neutral-200 bg-white p-6 xl:flex">
            <div className="flex flex-col items-center text-center">
              <AvatarInitials
                name={active.name}
                className={cn(
                  "h-20 w-20 text-2xl font-bold text-white",
                  paletteFor(active.id),
                )}
              />
              <p className="mt-4 text-base font-bold text-neutral-900">
                {active.name}
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">{active.role}</p>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              {active.currentShift && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-neutral-500">Current Shift</dt>
                  <dd className="text-right font-bold text-neutral-900">
                    {active.currentShift}
                  </dd>
                </div>
              )}
              {active.rating !== undefined && (
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">Rating</dt>
                  <dd className="flex items-center gap-1 font-bold text-neutral-900">
                    <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                    {active.rating}
                  </dd>
                </div>
              )}
              {active.completedShifts !== undefined && (
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">Completed Shifts</dt>
                  <dd className="font-bold text-neutral-900">
                    {active.completedShifts}
                  </dd>
                </div>
              )}
            </dl>

            {active.pinned && (
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Pinned Messages
                </p>
                <p className="mt-2 rounded-xl bg-neutral-50 px-4 py-3 text-xs italic leading-relaxed text-neutral-600">
                  {active.pinned}
                </p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                onClick={() =>
                  active.workerId
                    ? navigate(PATHS.hospital.workerDetail(active.workerId))
                    : navigate(PATHS.hospital.workers)
                }
                className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
