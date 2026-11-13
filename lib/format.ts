export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "--:--";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatBytes(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `~${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getHighResThumbnail(thumbnailUrl?: string, source?: string): string {
  if (!thumbnailUrl) return "";
  if (thumbnailUrl.includes("ytimg.com") || thumbnailUrl.includes("youtube.com")) {
    return thumbnailUrl
      .replace(/\/mqdefault\.jpg$/, "/maxresdefault.jpg")
      .replace(/\/hqdefault\.jpg$/, "/maxresdefault.jpg")
      .replace(/\/sddefault\.jpg$/, "/maxresdefault.jpg")
      .replace(/\/default\.jpg$/, "/maxresdefault.jpg");
  }
  return thumbnailUrl;
}
