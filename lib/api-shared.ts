import type { ApiErrorResponse } from "@video-downloader/types";

const getBaseUrl = () => {
  // Client-side: Browser
  if (typeof window !== "undefined") {
    // We want the browser to connect directly to the public API if available.
    // This bypasses the Next.js rewrite proxy, which often fails with SSE (502 Bad Gateway).
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Fallback to relative path which triggers Next.js rewrites
    return "";
  }

  // Server-side: Server Actions or SSR
  // Use the internal Docker network for faster, more reliable server-to-server calls.
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

const rawBaseUrl = getBaseUrl();
// Ensure we always have the /api prefix unless specifically overridden
export const API_BASE_URL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export class ApiError extends Error {
  code: string;
  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.code = response.code;
  }
}

export function getJobFileUrl(jobId: string): string {
  return `${API_BASE_URL}/video/jobs/${jobId}/file`;
}

export function getJobEventsUrl(jobId: string): string {
  return `${API_BASE_URL}/video/jobs/${jobId}/events`;
}
