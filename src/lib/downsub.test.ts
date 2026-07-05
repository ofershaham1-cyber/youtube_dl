import { describe, expect, it, vi } from "vitest";

import { buildSubtitleDownloadUrl, fetchVideoInfo, getDefaultTranscriptLanguages, getTranscriptSupportedLanguages, pickSubtitle } from "./downsub";

describe("downsub helpers", () => {
  it("builds a subtitle download URL with translation params", () => {
    const url = buildSubtitleDownloadUrl({
      subtitleUrl: "abc",
      format: "srt",
      title: "demo",
      language: "en",
      firstLanguage: "en",
      secondLanguage: "es",
      defaultLanguage: "en",
    });

    expect(url).toContain("firstLanguage=en");
    expect(url).toContain("secondLanguage=es");
    expect(url).toContain("defaultLanguage=en");
  });

  it("selects a subtitle from available manual and auto-translated entries", () => {
    const info = {
      state: 200,
      title: "demo",
      subtitles: [{ code: "en", name: "English", url: "manual" }],
      subtitlesAutoTrans: [{ code: "fr", name: "French", url: "auto" }],
      raw: {},
    };

    expect(pickSubtitle(info, "en")).toEqual({ entry: info.subtitles[0], isAutoTrans: false });
    expect(pickSubtitle(info, "fr")).toEqual({ entry: info.subtitlesAutoTrans[0], isAutoTrans: true });
  });

  it("returns the supported and default transcript languages from video info", () => {
    const info = {
      state: 200,
      title: "demo",
      subtitles: [{ code: "en", name: "English", url: "manual" }],
      subtitlesAutoTrans: [{ code: "fr", name: "French", url: "auto" }],
      raw: {
        subtitles: [{ code: "en", name: "English", url: "manual", isDefault: true }],
      },
    };

    expect(getTranscriptSupportedLanguages(info as never)).toEqual([
      { code: "en", name: "English", source: "manual", isDefault: false },
      { code: "fr", name: "French", source: "auto", isDefault: false },
    ]);

    expect(getDefaultTranscriptLanguages(info as never)).toEqual([
      { code: "en", name: "English", source: "manual", isDefault: true },
    ]);
  });
});

describe("fetchVideoInfo", () => {
  it("extracts a video ID and calls the DownSub info endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        state: 200,
        title: "demo",
        subtitles: [{ code: "en", name: "English", url: "manual" }],
        subtitlesAutoTrans: [],
      }),
    } as Response);

    const info = await fetchVideoInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    expect(info.title).toBe("demo");
    expect(fetchSpy).toHaveBeenCalled();
  });
});
