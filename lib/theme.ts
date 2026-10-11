export interface BrandTheme {
  name: string;
  primary: string;
  dim: string;
  bright: string;
  gradient?: string;
  borderColor?: string;
  glowShadow?: string;
  badgeLabel?: string;
}

const DEFAULT_THEME: BrandTheme = {
  name: "Reel",
  primary: "#FFA94D",
  dim: "#B87333",
  bright: "#FFC078",
  gradient: "linear-gradient(135deg, #3b82f6 0%, #1e1b4b 100%)",
  borderColor: "#6366f1",
  glowShadow: "0 0 10px rgba(99, 102, 241, 0.2)",
  badgeLabel: "Web Video",
};

const BRAND_CONFIGS: Record<string, Omit<BrandTheme, "dim" | "bright">> = {
  youtube: {
    name: "YouTube",
    primary: "#FF0000",
    gradient: "linear-gradient(135deg, #ff0000 0%, #280000 100%)",
    borderColor: "#ff0000",
    glowShadow: "0 0 12px rgba(255, 0, 0, 0.3)",
    badgeLabel: "YouTube Video",
  },
  instagram: {
    name: "Instagram",
    primary: "#E1306C",
    gradient: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    borderColor: "#e1306c",
    glowShadow: "0 0 15px rgba(225, 48, 108, 0.4)",
    badgeLabel: "Instagram Reel / Post",
  },
  tiktok: {
    name: "TikTok",
    primary: "#FE2C55",
    gradient: "linear-gradient(135deg, #00f2fe 0%, #fe2c55 100%)",
    borderColor: "#00f2fe",
    glowShadow: "-4px 0 12px rgba(0, 242, 254, 0.35), 4px 0 12px rgba(254, 44, 85, 0.35)",
    badgeLabel: "TikTok Video",
  },
  twitter: { name: "X / Twitter", primary: "#1DA1F2" },
  x: { name: "X", primary: "#FFFFFF" },
  facebook: { name: "Facebook", primary: "#1877F2" },
  vimeo: { name: "Vimeo", primary: "#1AB7EA" },
  twitch: { name: "Twitch", primary: "#9146FF" },
  reddit: { name: "Reddit", primary: "#FF4500" },
  pinterest: { name: "Pinterest", primary: "#E60023" },
  linkedin: { name: "LinkedIn", primary: "#0A66C2" },
  threads: { name: "Threads", primary: "#FFFFFF" },
  pornhub: {
    name: "Pornhub",
    primary: "#FFA31A",
    gradient: "linear-gradient(135deg, #ff9900 0%, #000000 100%)",
    borderColor: "#ff9900",
    glowShadow: "0 0 12px rgba(255, 153, 0, 0.3)",
    badgeLabel: "Adult Video (18+)",
  },
  onlyfans: { name: "Onlyfans", primary: "#00aff0" },
  fansly: { name: "Fansly", primary: "#00aff0" },
  thothub: { name: "Thothub", primary: "#9146FF" },
};

export function getBrandTheme(source?: string): BrandTheme {
  if (!source) return DEFAULT_THEME;

  const key = source.toLowerCase();

  const config = Object.entries(BRAND_CONFIGS)
    .sort(([a], [b]) => b.length - a.length)
    .find(([brand]) => {
      const regex = new RegExp(`(^|\\.)${brand}(\\.|$)`, "i");
      return regex.test(key) || key === brand;
    })?.[1];

  if (!config) return { ...DEFAULT_THEME, name: source };

  return {
    ...config,
    dim: config.primary,
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
