"use client";

import type { VideoInfo, FormatOption } from "@video-downloader/types";
import { X, Download, Play } from "lucide-react";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoInfo & { url?: string };
  formats: FormatOption[];
  onDownload: (format: FormatOption) => void;
}

export function MediaPreviewModal({
  isOpen,
  onClose,
  video,
  formats,
  onDownload,
}: MediaPreviewModalProps) {
  if (!isOpen) return null;

  const isVideo = video.duration > 0 || formats.some((f) => f.type === "video");
  const primaryFormat = formats[0];
  const imageSrc = video.url || video.thumbnail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-fade-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-surface-raised p-2 text-ink transition-colors hover:bg-surface-raised/80"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 pr-10 font-display text-lg font-bold text-ink">
          {video.title}
        </h3>

        <div className="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-xl bg-void p-2">
          {isVideo ? (
            <div className="relative aspect-video w-full flex items-center justify-center bg-void">
              {video.thumbnail ? (
                <div className="relative h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-void/40">
                    <div className="flex items-center gap-2 rounded-full bg-amber px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-void shadow-lg">
                      <Play className="h-4 w-4 fill-void" />
                      Ready to Play / Download
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center font-mono text-sm text-ink-muted">
                  Video Preview
                </div>
              )}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={video.title}
              className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            {isVideo ? `Duration: ${video.duration}s` : "Full Resolution Image"}
          </span>

          {primaryFormat && (
            <button
              type="button"
              onClick={() => {
                onDownload(primaryFormat);
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-void transition-opacity hover:opacity-90 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Download {isVideo ? "Video" : "Image"} ({primaryFormat.resolution || primaryFormat.container.toUpperCase()})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
