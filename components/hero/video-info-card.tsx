import type { VideoInfo } from "@video-downloader/types";
import { formatDuration } from "@/lib/format";
import { getBrandTheme } from "@/lib/theme";

export function VideoInfoCard({
  video,
  themeName,
  itemIndex,
}: {
  video: VideoInfo;
  themeName?: string;
  itemIndex?: number;
}) {
  const brandTheme = getBrandTheme(video.platform || video.source);
  const isInstagram = video.platform === "instagram" || video.source?.includes("instagram");
  const isTikTok = video.platform === "tiktok" || video.source?.includes("tiktok");

  let cardStyle: React.CSSProperties = {};
  if (isInstagram) {
    cardStyle = {
      background: "linear-gradient(135deg, rgba(131,58,180,0.15) 0%, rgba(253,29,29,0.15) 50%, rgba(252,176,69,0.15) 100%)",
      borderColor: "#e1306c",
      boxShadow: brandTheme.glowShadow,
    };
  } else if (isTikTok) {
    cardStyle = {
      background: "linear-gradient(135deg, rgba(0,242,254,0.12) 0%, rgba(254,44,85,0.12) 100%)",
      borderColor: "#00f2fe",
      boxShadow: brandTheme.glowShadow,
    };
  }

  return (
    <div
      style={cardStyle}
      className="relative flex animate-fade-up flex-col gap-4 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 sm:p-5"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {isInstagram ? (
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
            />
          ) : isTikTok ? (
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "linear-gradient(135deg, #00f2fe, #fe2c55)" }}
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          )}

          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {brandTheme.badgeLabel || `Detected on ${themeName || video.source}`}
          </p>
        </div>

        {itemIndex !== undefined && (
          <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            Video #{itemIndex + 1}
          </span>
        )}
      </div>

      <div className="flex gap-4 sm:gap-5">
        <div className="relative aspect-video w-28 flex-none overflow-hidden rounded-lg bg-surface-raised sm:w-40">
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink-muted">
              No preview
            </div>
          )}
          <span className="absolute bottom-1 right-1 rounded bg-void/80 px-1.5 py-0.5 font-mono text-[10px] tabular text-ink">
            {formatDuration(video.duration)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-base font-medium leading-snug sm:text-lg">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
