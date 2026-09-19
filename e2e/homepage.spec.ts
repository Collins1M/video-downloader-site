import { test, expect } from "next/experimental/testmode/playwright";

const analyzeResponse = {
  success: true,
  video: {
    title: "E2E Test Video",
    thumbnail: "",
    duration: 125,
    source: "example.com",
  },
  formats: [
    { id: "1080p-mp4", type: "video", container: "mp4", resolution: "1080p", estimatedSize: 45_000_000 },
    { id: "128kbps-mp3", type: "audio", container: "mp3", bitrateKbps: 128, estimatedSize: 2_000_000 },
  ],
};

test.describe("Homepage — download flow (happy path)", () => {
  test("analyze a URL, pick a format, watch progress, and reach completion", async ({ page, next }) => {
    // Intercept Server-side fetches (Server Actions)
    next.onFetch((request) => {
      if (request.url.includes("/api/video/analyze")) {
        return new Response(JSON.stringify(analyzeResponse), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (request.url.includes("/api/video/download")) {
        return new Response(JSON.stringify({ jobId: "e2e-job-1" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      return undefined;
    });

    // Intercept Client-side SSE (EventSource)
    await page.route("**/api/video/jobs/e2e-job-1/events", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: [
          `data: ${JSON.stringify({ id: "e2e-job-1", status: "processing", progress: 45 })}\n\n`,
          `data: ${JSON.stringify({ id: "e2e-job-1", status: "completed", progress: 100 })}\n\n`,
        ].join(""),
      });
    });

    // Intercept final file download trigger
    await page.route("**/api/video/jobs/e2e-job-1/file", (route) =>
      route.fulfill({ status: 200, contentType: "video/mp4", body: "fake video bytes" }),
    );

    await page.goto("/");

    await page.getByPlaceholder("Paste video URL here...").fill("https://example.com/video");
    await page.getByRole("button", { name: /analyze video/i }).click();

    await expect(page.getByText("Analyzing video…")).toBeVisible();
    await expect(page.getByText("E2E Test Video")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("example.com")).toBeVisible();

    await page.getByRole("button", { name: /download 1080p mp4/i }).click();

    await expect(page.getByText(/preparing your download/i)).toBeVisible();

    // Wait for completion — the panel returns to idle shortly after the download is handed off.
    await expect(page.getByPlaceholder("Paste video URL here...")).toBeVisible({ timeout: 15_000 });
  });

  test("shows a friendly error for an invalid URL", async ({ page, next }) => {
    next.onFetch((request) => {
      if (request.url.includes("/api/video/analyze")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Please enter a valid video URL.",
            code: "INVALID_URL",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return undefined;
    });

    await page.goto("/");
    await page.getByPlaceholder("Paste video URL here...").fill("not-a-real-url");
    await page.getByRole("button", { name: /analyze video/i }).click();

    await expect(page.getByText("Please enter a valid video URL.")).toBeVisible();
  });
});
