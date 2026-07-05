import { createFileRoute } from "@tanstack/react-router";

import { fetchVideoInfo, getDefaultTranscriptLanguages } from "@/lib/downsub";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

export const Route = createFileRoute("/api/default-transcript-languages")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const videoId = url.searchParams.get("videoID");
        if (!videoId) return json({ error: "Missing required query param: videoID" }, 400);

        try {
          const info = await fetchVideoInfo(videoId);
          return json(getDefaultTranscriptLanguages(info));
        } catch (err) {
          console.error("[/api/default-transcript-languages] upstream failure:", err);
          return json(
            {
              error: "SUBTITLE_SERVICE_UNAVAILABLE",
              message: (err as Error).message || "Unknown error",
              fallback: true,
            },
            200,
          );
        }
      },
    },
  },
});
