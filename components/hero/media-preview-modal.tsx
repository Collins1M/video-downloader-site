"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { VideoInfo, FormatOption } from "@video-downloader/types";
import { getPreviewUrl } from "@/lib/api-shared";

interface MediaPreviewModalProps {
  isOpen: boolean;
  video: (VideoInfo & { videoUrl?: string; formats?: FormatOption[] }) | null;
  onClose: () => void;
}

export function MediaPreviewModal({ isOpen, video, onClose }: MediaPreviewModalProps) {
  const videoKey = (video?.title ?? "") + (video?.thumbnail ?? "") + (video?.videoUrl ?? "");
  const [prevVideoKey, setPrevVideoKey] = useState(videoKey);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (videoKey !== prevVideoKey) {
    setPrevVideoKey(videoKey);
    setVideoError(false);
  }

  // Formats are the reliable signal; duration may be unknown (0) for a genuine video.
  const isVideo = Boolean(video) && (
    Boolean(video?.videoUrl) ||
    (video?.duration ?? 0) > 0 ||
    (video?.formats ? video.formats.some((f) => f.type === "video" || f.type === "gif") : false)
  );
  const isImage = !isVideo;
  const isHls = video?.previewKind === "hls";

  // Only a real media URL (from the backend) is ever handed to the player. It is relayed through
  // the API so hotlink protection / IP-bound CDN links can't break playback.
  const playableSrc =
    isOpen && !isImage && video?.videoUrl && !videoError ? getPreviewUrl(video.videoUrl) : undefined;

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

  // HLS: Safari plays it natively; everything else goes through hls.js (loaded on demand).
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !playableSrc || !isHls) return;

    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = playableSrc;
      return;
    }

    let cancelled = false;
    let hls: { destroy: () => void } | undefined;
    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setVideoError(true);
          return;
        }
        // enableWorker: the CSP has no blob: worker-src, so keep parsing on the main thread.
        const instance = new Hls({ enableWorker: false });
        hls = instance;
        instance.on(Hls.Events.ERROR, (_event: unknown, data: { fatal?: boolean }) => {
          if (data.fatal) setVideoError(true);
        });
        instance.loadSource(playableSrc);
        instance.attachMedia(el);
      })
      .catch(() => setVideoError(true));

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [playableSrc, isHls]);

  if (!isOpen || !video) return null;

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

        <div className="flex flex-1 flex-col items-center justify-center overflow-auto bg-black/40 p-4 gap-2">
          {playableSrc ? (
            <video
              key={playableSrc}
              ref={videoRef}
              src={isHls ? undefined : playableSrc}
              poster={video.thumbnail || undefined}
              controls
              // Browsers only allow autoplay when muted; otherwise play() is silently blocked.
              autoPlay
              muted
              playsInline
              preload="metadata"
              onError={() => {
                console.warn("[MediaPreviewModal] Playback failed; showing thumbnail instead.");
                setVideoError(true);
              }}
              className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-lg bg-black"
            />
          ) : video.thumbnail ? (
            <>
              {!isImage && (
                <p className="mb-2 font-mono text-xs text-amber">
                  {videoError
                    ? "The video couldn't be streamed from the source. Showing the thumbnail instead."
                    : "No browser-playable preview is available for this source. Showing the thumbnail."}
                </p>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
              />
            </>
          ) : (
            <p className="font-mono text-sm text-ink-muted">No preview available</p>
          )}
        </div>

        {(video.videoUrl || video.thumbnail) && (
          <div className="flex items-center justify-between border-t border-line bg-surface/80 px-5 py-2.5">
            <span className="font-mono text-xs text-ink-muted">
              {isImage ? "Photo Preview" : playableSrc ? "Video Player" : "Thumbnail Preview"}
            </span>
            <a
              href={video.videoUrl || video.thumbnail}
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