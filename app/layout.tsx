import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Video Downloader — Download Supported Videos in Multiple Formats",
    template: "%s — Reel",
  },
  description:
    "Download supported online videos in your preferred quality and format with a fast, simple video downloader.",
  icons: {
    icon: "/favicon.ico",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Video Downloader",
    description:
      "Paste a supported video link, choose your preferred format and quality, and download it directly to your device.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Downloader",
    description:
      "Paste a supported video link, choose your preferred format and quality, and download it directly to your device.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
