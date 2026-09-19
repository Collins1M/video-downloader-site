"use server";

import { cookies } from "next/headers";
import type {
  AnalyzeResponse,
  CreateDownloadResponse,
  JobStatusResponse,
  ApiErrorResponse,
} from "@video-downloader/types";
import { API_BASE_URL, ApiError } from "./api-shared";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const url = `${API_BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
        ...init?.headers,
      },
      // Ensure we don't hang the server action forever
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    throw new ApiError({
      success: false,
      message: "The backend is unreachable. Please ensure the backend is running.",
      code: "INTERNAL_ERROR",
    });
  }

  try {
    const text = await res.text();

    if (!res.ok) {
      let body: ApiErrorResponse;
      try {
        body = JSON.parse(text);
      } catch {
        if (res.status === 408 || res.status === 504) {
          body = {
            success: false,
            message: "The request timed out. The video analysis is taking longer than expected.",
            code: "TIMEOUT",
          };
        } else {
          body = {
            success: false,
            message: `Backend error (${res.status}): ${text.slice(0, 100)}`,
            code: "INTERNAL_ERROR",
          };
        }
      }
      throw new ApiError(body);
    }

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`Failed to parse successful response from ${url}:`, text);
      throw new ApiError({
        success: false,
        message: "Backend returned an invalid response format.",
        code: "INTERNAL_ERROR",
      });
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError({
      success: false,
      message: "An unexpected error occurred while communicating with the backend.",
      code: "INTERNAL_ERROR",
    });
  }
}

export async function analyzeVideo(url: string): Promise<AnalyzeResponse | ApiErrorResponse> {
  try {
    return await request<AnalyzeResponse>("/video/analyze", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message, code: err.code as any };
    }
    throw err;
  }
}

export async function createDownload(
  url: string,
  formatId: string,
): Promise<CreateDownloadResponse | ApiErrorResponse> {
  try {
    return await request<CreateDownloadResponse>("/video/download", {
      method: "POST",
      body: JSON.stringify({ url, formatId }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message, code: err.code as any };
    }
    throw err;
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse | ApiErrorResponse> {
  try {
    return await request<JobStatusResponse>(`/video/jobs/${jobId}`);
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message, code: err.code as any };
    }
    throw err;
  }
}

export async function cancelJob(jobId: string): Promise<JobStatusResponse | ApiErrorResponse> {
  try {
    return await request<JobStatusResponse>(`/video/jobs/${jobId}`, { method: "DELETE" });
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message, code: err.code as any };
    }
    throw err;
  }
}
