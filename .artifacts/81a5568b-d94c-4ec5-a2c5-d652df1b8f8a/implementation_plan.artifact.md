# Fix Backend Error Handling and Frontend API URL Configuration

This plan addresses two issues identified from the logs:
1.  **Instagram Authentication Error**: The backend generic error masking hides the fact that `yt-dlp` requires cookies for Instagram stories.
2.  **API 404 Error**: The frontend `API_BASE_URL` logic is susceptible to misconfiguration if the `NEXT_PUBLIC_API_URL` environment variable is missing the `/api` suffix.

## User Review Required

> [!IMPORTANT]
> To actually download Instagram stories, you will need to provide a cookies file to the backend. This plan improves the **error message** so you know what's happening, but you will still need to set the `YT_DLP_COOKIES` environment variable in your backend `.env` pointing to a valid Netscape-formatted cookie file.

## Proposed Changes

### [Component] Backend Media Extractor

#### [MODIFY] [errors.ts](file:///D:/Local Disk/Angular/video-downloader-backend/packages/media-extractor/src/errors.ts)
- Add `AuthenticationRequiredError` class.

#### [MODIFY] [yt-dlp.ts](file:///D:/Local Disk/Angular/video-downloader-backend/packages/media-extractor/src/yt-dlp.ts)
- Update error detection logic to check for "You need to log in" and "confirm your age" in the `yt-dlp` output.

---

### [Component] Backend API

#### [MODIFY] [app-exceptions.ts](file:///D:/Local Disk/Angular/video-downloader-backend/apps/api/src/common/exceptions/app-exceptions.ts)
- Add `AuthenticationRequiredException` (HTTP 401 or 403) with a friendly message informing the user that the content is protected.

#### [MODIFY] [yt-dlp-media-analyzer.ts](file:///D:/Local Disk/Angular/video-downloader-backend/apps/api/src/video/yt-dlp-media-analyzer.ts)
- Update the `analyze` method to catch the new `AuthenticationRequiredError` and throw the corresponding `AppException`.

---

### [Component] Frontend Utilities

#### [MODIFY] [api-shared.ts](file:///D:/Local Disk/Angular/video-downloader-frontend/lib/api-shared.ts)
- Update `API_BASE_URL` logic to automatically append `/api` if it is missing from the `NEXT_PUBLIC_API_URL` environment variable.

## Verification Plan

### Automated Tests
- Run backend media-extractor unit tests to verify error detection.
- Run frontend unit tests to verify `API_BASE_URL` resolution.

### Manual Verification
- Attempt to analyze an Instagram story URL and verify that a specific "Login/Authentication Required" error is returned instead of a generic "Something went wrong" message.
- Verify that standard analysis requests (e.g. YouTube) still work correctly with the updated URL logic.
