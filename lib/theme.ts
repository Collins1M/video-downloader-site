export interface BrandTheme {
  name: string;
  primary: string;
  dim: string;
  bright: string;
}

const DEFAULT_THEME: BrandTheme = {
  name: "Reel",
  primary: "#FFA94D",
  dim: "#B87333",
  bright: "#FFC078",
};

const BRAND_CONFIGS: Record<string, Omit<BrandTheme, "dim" | "bright">> = {
  youtube: { name: "YouTube", primary: "#FF0000" },
  instagram: { name: "Instagram", primary: "#E4405F" },
  tiktok: { name: "TikTok", primary: "#EE1D52" },
  twitter: { name: "X / Twitter", primary: "#1DA1F2" },
  x: { name: "X", primary: "#FFFFFF" },
  facebook: { name: "Facebook", primary: "#1877F2" },
  vimeo: { name: "Vimeo", primary: "#1AB7EA" },
  twitch: { name: "Twitch", primary: "#9146FF" },
  reddit: { name: "Reddit", primary: "#FF4500" },
  pinterest: { name: "Pinterest", primary: "#E60023" },
  linkedin: { name: "LinkedIn", primary: "#0A66C2" },
  threads: { name: "Threads", primary: "#FFFFFF" },
  pornhub: { name:"Pornhub", primary:"#FFA31A"},
  onlyfans: {name: "Onlyfans", primary: "#00aff0"},
  fansly: {name: "Fansly", primary: "#00aff0"},
  thothub: {name: "Thothub", primary: "#9146FF"},



};

export function getBrandTheme(source?: string): BrandTheme {
  if (!source) return DEFAULT_THEME;

  const key = source.toLowerCase();

  // Sort by length descending to match "twitter" before "x"
  const config = Object.entries(BRAND_CONFIGS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([brand]) => {
      // Precise matching: brand should be a distinct part of the hostname
      // e.g. "youtube" matches "youtube.com" or "www.youtube.com"
      // but "x" won't match "example.com"
      const regex = new RegExp(`(^|\\.)${brand}(\\.|$)`, 'i');
      return regex.test(key) || key === brand;
    })?.[1];

  if (!config) return { ...DEFAULT_THEME, name: source };

  // Simple auto-generation for dim/bright if not provided
  // In a real app we might use a color library to darken/lighten
  return {
    ...config,
    dim: config.primary, // Could be more sophisticated
    bright: config.primary,
  };
}

export function getThemeInlineStyles(theme: BrandTheme): React.CSSProperties {
  return {
    "--brand-primary": theme.primary,
    "--brand-dim": theme.dim,
    "--brand-bright": theme.bright,
  } as React.CSSProperties;
}
