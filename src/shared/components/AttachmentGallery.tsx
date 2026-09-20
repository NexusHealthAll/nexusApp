import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

/** Best-effort human file name from a Cloudinary (or any) URL. */
function fileNameFromUrl(url: string, index: number): string {
  try {
    const path = new URL(url).pathname;
    const last = decodeURIComponent(path.split("/").pop() ?? "");
    return last || `Attachment ${index + 1}`;
  } catch {
    return `Attachment ${index + 1}`;
  }
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|bmp|svg|heic|heif)(\?|$)/i;

/** Treat a URL as a previewable image (Cloudinary image delivery, or an image ext). */
function isImageUrl(url: string): boolean {
  if (/\.pdf(\?|$)/i.test(url)) return false;
  if (IMAGE_EXT.test(url)) return true;
  // Cloudinary image resource URLs may carry no extension.
  return /res\.cloudinary\.com\/.+\/image\/upload\//i.test(url);
}

// ── Fullscreen image lightbox ──────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const prev = useCallback(
    () => onIndex((index - 1 + count) % count),
    [index, count, onIndex],
  );
  const next = useCallback(
    () => onIndex((index + 1) % count),
    [index, count, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) prev();
      else if (e.key === "ArrowRight" && count > 1) next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose, count]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <a
        href={images[index]}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open original
      </a>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Previous image"
          className="absolute left-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={images[index]}
        alt={`Preview ${index + 1} of ${count}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Next image"
          className="absolute right-2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {count > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {count}
        </p>
      )}
    </div>,
    document.body,
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────

/**
 * Renders a set of URLs — Cloudinary `secure_url`s from shift `attachment_urls`
 * (#5) or handover `image_urls` (#1). Images render as a thumbnail grid that
 * opens a fullscreen lightbox on click (keyboard + prev/next); non-image files
 * (PDFs) render as download chips that open in a new tab.
 */
export function AttachmentGallery({
  urls,
  imageOnly = false,
  className,
}: {
  urls: string[];
  /** Treat every URL as an image (handover photos) — skip the file-chip branch. */
  imageOnly?: boolean;
  className?: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  const images = imageOnly ? urls : urls.filter(isImageUrl);
  const files = imageOnly ? [] : urls.filter((u) => !isImageUrl(u));

  return (
    <div className={cn("space-y-3", className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((url, i) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <FileText className="h-4 w-4 flex-shrink-0 text-error-500 dark:text-error-400" />
                <span className="truncate">{fileNameFromUrl(url, i)}</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          index={Math.min(lightboxIndex, images.length - 1)}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
