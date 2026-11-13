"use client";

import { useState } from "react";
import type { VideoInfo, FormatOption } from "@video-downloader/types";
import { X, Download, Play, Loader2 } from "lucide-react";
import { getHighResThumbnail } from "@/lib/format";
import { createDownload } from "@/lib/api";
import { getJobFileUrl, getJobEventsUrl } from "@/lib/api-shared";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [prepProgress, setPrepProgress] = useState(0);

  if (!isOpen) return null;

  const isVideo = video.duration > 0 || formats.some((f) => f.type === "video");
  const primaryFormat = formats.find((f) => f.type === "video") || formats[0];
  const imageSrc = getHighResThumbnail(video.url || video.thumbnail, video.source);
  const mediaUrl = video.url;

  async function handlePlayVideo() {
    if (mediaUrl && (mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm") || mediaUrl.includes(".mp4?"))) {
      setStreamUrl(mediaUrl);
      setIsPlaying(true);
      return;
    }

    if (!primaryFormat) return;

    setPreparing(true);
    setPrepProgress(0);

    try {
      const targetUrl = video.url || video.thumbnail;
      const res = await createDownload(targetUrl, primaryFormat.id);

      if ("message" in res) {
        setPreparing(false);
        onDownload(primaryFormat);
        return;
      }

      const jobId = res.jobId;
      const eventsUrl = getJobEventsUrl(jobId);
      const eventSource = new EventSource(eventsUrl, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const status = JSON.parse(event.data);
          if (status.status === "completed") {
            eventSource.close();
            setPreparing(false);
            setStreamUrl(getJobFileUrl(jobId));
            setIsPlaying(true);
          } else if (status.status === "failed") {
            eventSource.close();
            setPreparing(false);
            onDownload(primaryFormat);
          } else {
            setPrepProgress(status.progress || 0);
          }
        } catch {
          eventSource.close();
          setPreparing(false);
          onDownload(primaryFormat);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setPreparing(false);
        onDownload(primaryFormat);
      };
    } catch {
      setPreparing(false);
      onDownload(primaryFormat);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-fade-up">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setStreamUrl(null);
            setPreparing(false);
            onClose();
          }}
          className="absolute right-4 top-4 z-10 rounded-full bg-surface-raised p-2 text-ink transition-colors hover:bg-surface-raised/80"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 pr-10 font-display text-lg font-bold text-ink">
          {video.title}
        </h3>

        <div className="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-xl bg-void p-2">
          {isVideo && isPlaying && streamUrl ? (
            <video
              controls
              autoPlay
              src={streamUrl}
              className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
            />
          ) : isVideo ? (
            <div className="relative aspect-video w-full flex items-center justify-center bg-void">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={video.title}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                disabled={preparing}
                onClick={handlePlayVideo}
                className="absolute inset-0 flex items-center justify-center bg-void/40 group cursor-pointer transition-colors hover:bg-void/30"
              >
                {preparing ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-void/90 px-6 py-4 font-mono text-xs font-semibold text-ink shadow-lg backdrop-blur">
                    <Loader2 className="h-6 w-6 animate-spin text-amber" />
                    <span>Preparing Video Stream ({prepProgress}%)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full bg-amber px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-void shadow-lg transition-transform group-hover:scale-105">
                    <Play className="h-4 w-4 fill-void" />
                    Play Video / Stream
                  </div>
                )}
              </button>
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
            {isVideo ? (video.duration > 0 ? `Duration: ${video.duration}s` : "Video Clip") : "Full Resolution Image"}
          </span>

          {primaryFormat && (
            <button
              type="button"
              onClick={() => {
                onDownload(primaryFormat);
                setIsPlaying(false);
                setStreamUrl(null);
                setPreparing(false);
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
