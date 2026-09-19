import type { ApiErrorResponse } from "@video-downloader/types";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
// Automatically append /api if the user provided just the base domain/port,
// preventing 404s when hitting "/" instead of "/api/video/analyze".
export const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

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
