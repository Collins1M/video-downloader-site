"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnalyzeResponse,
  FormatOption,
  JobStatusResponse,
  CreateDownloadResponse,
  AnalyzedVideoItem,
  VideoInfo,
} from "@video-downloader/types";
import { Download } from "lucide-react";
import { analyzeVideo, createDownload, cancelJob } from "@/lib/api";
import { getJobFileUrl, getJobEventsUrl, ApiError } from "@/lib/api-shared";
import { captureClientError } from "@/lib/sentry";
import { useTheme } from "@/components/theme-provider";
import { UrlInputForm } from "./url-input-form";
import { AnalyzingState } from "./analyzing-state";
import { VideoInfoCard } from "./video-info-card";
import { FormatList } from "./format-list";
import { DownloadProgress } from "./download-progress";
import { AgeConsentModal } from "./age-consent-modal";
import { MediaPreviewModal } from "./media-preview-modal";

type Flow =
  | { step: "idle" }
  | { step: "analyzing" }
  | { step: "analyzed"; result: AnalyzeResponse }
  | { step: "error"; message: string }
  | { step: "downloading"; jobId: string; progress: number; formatLabel: string }
  | { step: "download-error"; message: string };

export function DownloaderPanel() {
  const [url, setUrl] = useState("");
  const [flow, setFlow] = useState<Flow>({ step: "idle" });
  const [showAgeConsentModal, setShowAgeConsentModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    video: VideoInfo;
    formats: FormatOption[];
    itemUrl?: string;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const { theme, setThemeFromSource } = useTheme();

  // Trigger theme change when analyzed source changes
  useEffect(() => {
    if (flow.step === "analyzed") {
      setThemeFromSource(flow.result.video.source);
    }
  }, [flow, setThemeFromSource]);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => stopStreaming, [stopStreaming]);

  async function handleAnalyze(ageConsent: boolean = false) {
    setShowAgeConsentModal(false);
    setFlow({ step: "analyzing" });

    if (url.trim()) {
      setThemeFromSource(url.trim());
    }

    const result = await analyzeVideo(url.trim(), ageConsent);

    if ("message" in result) {
      if (result.code === "AGE_VERIFICATION_REQUIRED") {
        setShowAgeConsentModal(true);
        setFlow({ step: "idle" });
      } else {
        setFlow({ step: "error", message: result.message });
      }
    } else {
      setFlow({ step: "analyzed", result: result as AnalyzeResponse });
      setThemeFromSource((result as AnalyzeResponse).video.source);
    }
  }

  async function handleSelectFormat(format: FormatOption, itemUrl?: string) {
    const formatLabel =
      format.type === "video"
        ? `${format.resolution} ${format.container.toUpperCase()}`
        : format.type === "gif"
        ? `${format.resolution} Animated GIF`
        : format.type === "image"
        ? `${format.resolution || "HD"} Image`
        : `${format.bitrateKbps} kbps ${format.container.toUpperCase()}`;

    const targetUrl = itemUrl || url.trim();
    const result = await createDownload(targetUrl, format.id);

    if ("message" in result) {
      setFlow({ step: "download-error", message: result.message });
      return;
    }

    const { jobId } = result as CreateDownloadResponse;
    setFlow({ step: "downloading", jobId, progress: 0, formatLabel });

    try {
      const eventsUrl = getJobEventsUrl(jobId);
      const source = new EventSource(eventsUrl, { withCredentials: true });
      eventSourceRef.current = source;

      source.onmessage = (event) => {
        let status: JobStatusResponse;
        try {
          status = JSON.parse(event.data);
        } catch (err) {
          stopStreaming();
          setFlow({ step: "download-error", message: friendlyMessage(err) });
          return;
        }

        if (status.status === "completed") {
          const fileUrl = getJobFileUrl(jobId);
          stopStreaming();
          setFlow({ step: "downloading", jobId, progress: 100, formatLabel });
          downloadLinkRef.current?.setAttribute("href", fileUrl);
          downloadLinkRef.current?.click();
          setTimeout(() => setFlow({ step: "idle" }), 5000);
          return;
        }

        if (status.status === "failed") {
          stopStreaming();
          setFlow({ step: "download-error", message: status.error ?? "This download failed. Please try again." });
          return;
        }

        if (status.status === "cancelled") {
          stopStreaming();
          setFlow({ step: "idle" });
          return;
        }

        setFlow((prev) =>
          prev.step === "downloading" ? { ...prev, progress: status.progress } : prev,
        );
      };

      source.onerror = () => {
        if (source.readyState === EventSource.CLOSED) {
          stopStreaming();
          setFlow({ step: "download-error", message: "Lost connection while downloading. Please try again." });
        }
      };
    } catch (err) {
      setFlow({ step: "download-error", message: friendlyMessage(err) });
    }
  }

  async function handleCancel() {
    if (flow.step !== "downloading") return;
    stopStreaming();
    try {
      await cancelJob(flow.jobId);
    } catch {
      // Best-effort self-expire
    }
    setFlow({ step: "idle" });
  }

  function handleReset() {
    stopStreaming();
    setFlow({ step: "idle" });
  }

  async function handleDownloadAll(videos: AnalyzedVideoItem[]) {
    for (const item of videos) {
      if (item.formats && item.formats.length > 0) {
        await handleSelectFormat(item.formats[0], item.url);
      }
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Hidden anchor used purely to trigger the browser's native download UI once a job completes. */}
      <a ref={downloadLinkRef} className="hidden" download aria-hidden="true" />

      <AgeConsentModal
        isOpen={showAgeConsentModal}
        onConfirm={() => handleAnalyze(true)}
        onCancel={() => setShowAgeConsentModal(false)}
      />

      <MediaPreviewModal
        isOpen={previewMedia !== null}
        onClose={() => setPreviewMedia(null)}
        video={previewMedia?.video!}
        formats={previewMedia?.formats!}
        onDownload={(fmt) => handleSelectFormat(fmt, previewMedia?.itemUrl)}
      />

      {(flow.step === "idle" || flow.step === "error") && (
        <>
          <UrlInputForm url={url} onUrlChange={setUrl} onSubmit={() => handleAnalyze(false)} disabled={false} />
          {flow.step === "error" && (
            <p className="mt-3 text-center font-mono text-sm text-amber">{flow.message}</p>
          )}
        </>
      )}

      {flow.step === "analyzing" && <AnalyzingState />}

      {flow.step === "analyzed" && (
        <div className="space-y-6">
          {flow.result.isPlaylist && flow.result.videos && flow.result.videos.length > 1 ? (
            <div className="space-y-8">
              {(() => {
                const isImageGallery = flow.result.videos.every((v) => v.formats.some((f) => f.type === "image") || v.video.duration === 0);
                const count = flow.result.totalVideos || flow.result.videos.length;
                return (
                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber/30 bg-surface p-4 sm:flex-row">
                    <div className="text-center sm:text-left">
                      <span className="font-mono text-xs uppercase tracking-wider text-amber font-semibold">
                        {isImageGallery ? `Multi-Image Gallery Detected (${count} Images)` : `Multi-Video Playlist Detected (${count} Videos)`}
                      </span>
                      <h2 className="mt-1 font-display text-lg font-bold text-ink">
                        {flow.result.playlistTitle || (isImageGallery ? "Extracted Photos" : "Extracted Videos")}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadAll(flow.result.videos!)}
                      className="flex items-center gap-2 rounded-xl bg-amber px-4 py-2 font-mono text-xs uppercase tracking-wider text-void font-semibold transition-opacity hover:opacity-90"
                    >
                      <Download className="h-4 w-4" />
                      Download All ({count})
                    </button>
                  </div>
                );
              })()}

              {flow.result.videos.map((item, idx) => (
                <div key={item.id || idx} className="space-y-4 rounded-2xl border border-line/60 bg-surface/50 p-4">
                  <VideoInfoCard
                    video={item.video}
                    formats={item.formats}
                    themeName={theme.name}
                    itemIndex={idx}
                    onClick={() => setPreviewMedia({ video: item.video, formats: item.formats, itemUrl: item.url })}
                  />
                  <FormatList
                    formats={item.formats}
                    onSelect={(fmt) => handleSelectFormat(fmt, item.url)}
                    disabled={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <VideoInfoCard
                video={flow.result.video}
                formats={flow.result.formats}
                themeName={theme.name}
                onClick={() => setPreviewMedia({ video: flow.result.video, formats: flow.result.formats })}
              />
              <FormatList formats={flow.result.formats} onSelect={(fmt) => handleSelectFormat(fmt)} disabled={false} />
            </>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="mx-auto block font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
          >
            ← Analyze a different video
          </button>
        </div>
      )}

      {flow.step === "downloading" && (
        <DownloadProgress
          progress={flow.progress}
          formatLabel={flow.formatLabel}
          onCancel={handleCancel}
        />
      )}

      {flow.step === "download-error" && (
        <div className="animate-fade-up rounded-2xl border border-line bg-surface p-6 text-center">
          <p className="font-mono text-sm text-amber">{flow.message}</p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 font-mono text-xs uppercase tracking-wide text-ink-muted transition-colors hover:text-ink"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

function friendlyMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  captureClientError(err);
  return "Something went wrong. Please try again.";
}
