import type { ApiErrorResponse } from "@video-downloader/types";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
// Ensure we always have the /api prefix unless specifically overridden
export const API_BASE_URL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export class ApiError extends Error {
  code: string;
  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.code = response.code;
  }
}

/**
 * URL the preview <video> should use for a media URL returned by /analyze. Goes through the
 * API's relay because raw CDN links are hotlink-protected / bound to the server's IP.
 */
export function getPreviewUrl(mediaUrl: string): string {
  return `${API_BASE_URL}/video/preview?url=${encodeURIComponent(mediaUrl)}`;
}

export function getJobFileUrl(jobId: string): string {
  return `${API_BASE_URL}/video/jobs/${jobId}/file`;
}

export function getJobEventsUrl(jobId: string): string {
  return `${API_BASE_URL}/video/jobs/${jobId}/events`;
}