import type { ApiErrorResponse } from "@video-downloader/types";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // In the browser, we prioritize the env var, but fallback to relative path if needed
    return process.env.NEXT_PUBLIC_API_URL || "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
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
