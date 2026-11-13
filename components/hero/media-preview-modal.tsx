"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import type { VideoInfo } from "@video-downloader/types";

interface MediaPreviewModalProps {
  isOpen: boolean;
  video: VideoInfo | null;
  onClose: () => void;
}

export function MediaPreviewModal({ isOpen, video, onClose }: MediaPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const isImage = video.duration === 0 || !video.duration;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="line-clamp-1 font-display text-sm font-medium text-ink">
            {video.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-black/40 p-4">
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail}
              alt={video.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
            />
          ) : (
            <p className="font-mono text-sm text-ink-muted">No preview available</p>
          )}
        </div>

        {video.thumbnail && (
          <div className="flex items-center justify-between border-t border-line bg-surface/80 px-5 py-2.5">
            <span className="font-mono text-xs text-ink-muted">
              {isImage ? "Photo Preview" : "Video Thumbnail"}
            </span>
            <a
              href={video.thumbnail}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-amber hover:underline"
            >
              Open original <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
