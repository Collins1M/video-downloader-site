import type { VideoInfo, FormatOption } from "@video-downloader/types";
import { formatDuration, getHighResThumbnail } from "@/lib/format";
import { getBrandTheme } from "@/lib/theme";

// One source of truth for the platform gradients: the card background, the label text and the
// dot all derive from these stops (the card uses a translucent version, the label/dot full strength).
const BRAND_GRADIENT_STOPS = {
  instagram: ["131,58,180", "253,29,29", "252,176,69"],
  tiktok: ["0,242,254", "254,44,85"],
} as const;

function brandGradient(platform: keyof typeof BRAND_GRADIENT_STOPS, alpha: number): string {
  const stops = BRAND_GRADIENT_STOPS[platform];
  const parts = stops.map((rgb, i) => `rgba(${rgb},${alpha}) ${Math.round((i / (stops.length - 1)) * 100)}%`);
  return `linear-gradient(135deg, ${parts.join(", ")})`;
}

export function VideoInfoCard({
  video,
  themeName,
  itemIndex,
  formats,
  onClick,
  onThumbnailClick,
}: {
  video: VideoInfo;
  themeName?: string;
  itemIndex?: number;
  formats?: FormatOption[];
  onClick?: () => void;
  onThumbnailClick?: (video: VideoInfo) => void;
}) {
  const brandTheme = getBrandTheme(video.platform || video.source);
  const isInstagram = video.platform === "instagram" || video.source?.includes("instagram");
  const isTikTok = video.platform === "tiktok" || video.source?.includes("tiktok");
  // Duration can legitimately be unknown (0) for a real video; formats are the reliable signal.
  const isVideo =
    video.duration > 0 ||
    (formats ? formats.some((f) => f.type === "video" || f.type === "gif") : !isInstagram);
  const thumbUrl = getHighResThumbnail(video.thumbnail, video.source);

  let cardStyle: React.CSSProperties = {};
  if (isInstagram) {
    cardStyle = {
      background: brandGradient("instagram", 0.28),
      boxShadow: brandTheme.glowShadow,
    };
  } else if (isTikTok) {
    cardStyle = {
      background: brandGradient("tiktok", 0.24),
      boxShadow: brandTheme.glowShadow,
    };
  }

  const brandKey = isInstagram ? "instagram" : isTikTok ? "tiktok" : undefined;
  // Label text is filled with the same gradient as the card; plain muted text for other sites.
  const labelStyle: React.CSSProperties | undefined = brandKey
    ? {
      backgroundImage: brandGradient(brandKey, 1),
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    }
    : undefined;

  const handleThumbClick = (e: React.MouseEvent) => {
    if (onThumbnailClick) {
      e.stopPropagation();
      onThumbnailClick(video);
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative flex animate-fade-up flex-col gap-4 rounded-2xl border border-line bg-surface p-4 transition-all duration-300 sm:p-5 ${onClick ? "cursor-pointer hover:border-amber/50 hover:shadow-lg" : ""
        }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {brandKey ? (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: brandGradient(brandKey, 1) }}
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          )}

          <p
            style={labelStyle}
            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${brandKey ? "" : "text-ink-muted"}`}
          >
            {brandTheme.badgeLabel || `Detected on ${themeName || video.source}`}
          </p>
        </div>

        {itemIndex !== undefined && (
          <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            {isVideo ? `Video #${itemIndex + 1}` : `Photo #${itemIndex + 1}`}
          </span>
        )}
      </div>

      <div className="flex gap-4 sm:gap-5">
        <div
          onClick={handleThumbClick}
          className={`relative ${isVideo ? "aspect-video" : "aspect-square"} w-28 flex-none overflow-hidden rounded-lg bg-surface-raised sm:w-40 ${onThumbnailClick ? "cursor-pointer group hover:ring-2 hover:ring-amber/50 transition-all" : ""
            }`}
        >
          {video.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                // maxresdefault.jpg doesn't exist for many YouTube videos: fall back to the original.
                const img = e.currentTarget;
                if (img.dataset.fallback !== "1" && video.thumbnail && img.src !== video.thumbnail) {
                  img.dataset.fallback = "1";
                  img.src = video.thumbnail;
                }
              }}
              className="h-full w-full object-contain bg-black/20 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-ink-muted">
              No preview
            </div>
          )}
          <span className="absolute bottom-1 right-1 rounded bg-void/80 px-1.5 py-0.5 font-mono text-[10px] tabular text-ink">
            {video.duration > 0 ? formatDuration(video.duration) : isVideo ? "VIDEO" : "PHOTO"}
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