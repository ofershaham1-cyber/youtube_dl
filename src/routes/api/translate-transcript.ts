import { createFileRoute } from "@tanstack/react-router";

import { fetchTranslatedSubtitle, type SubtitleFormat } from "@/lib/downsub";

const FORMATS: SubtitleFormat[] = ["srt", "vtt", "txt"];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

export const Route = createFileRoute("/api/translate-transcript")({
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
        const sourceLanguage = url.searchParams.get("language") ?? "en";
        const targetLanguage = url.searchParams.get("targetLanguage");
        const format = (url.searchParams.get("type") ?? "srt").toLowerCase() as SubtitleFormat;
        const includeAutoTrans = url.searchParams.get("autoTranslate") !== "0";

        if (!videoId) return json({ error: "Missing required query param: videoID" }, 400);
        if (!targetLanguage) return json({ error: "Missing required query param: targetLanguage" }, 400);
        if (!FORMATS.includes(format)) {
          return json(
            { error: `Invalid type. Must be one of: ${FORMATS.join(", ")}` },
            400,
          );
        }

        try {
          const result = await fetchTranslatedSubtitle({
            videoUrlOrId: videoId,
            format,
            language: sourceLanguage,
            targetLanguage,
            includeAutoTrans,
          });

          return json(result);
        } catch (err) {
          const message = (err as Error).message || "Unknown error";
          console.error("[/api/translate-transcript] upstream failure:", err);
          return json(
            {
              error: "SUBTITLE_SERVICE_UNAVAILABLE",
              message,
              fallback: true,
            },
            200,
          );
        }
      },
    },
  },
});
