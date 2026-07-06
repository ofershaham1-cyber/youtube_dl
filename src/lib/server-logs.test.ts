import { beforeEach, describe, expect, it } from "vitest";

import { clearServerLogs, getServerLogs, recordServerRequest } from "./server-logs";

describe("server logs", () => {
  beforeEach(() => {
    clearServerLogs();
  });

  it("stores request metadata with a formatted timestamp and query params", () => {
    const request = new Request(
      "https://example.com/api/subtitles?url=https%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3D123&type=srt&language=en",
    );

    recordServerRequest(request);

    const logs = getServerLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      id: 1,
      method: "GET",
      pathname: "/api/subtitles",
      searchParams: {
        url: "https://youtube.com/watch?v=123",
        type: "srt",
        language: "en",
      },
    });
    expect(logs[0].timestamp).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
  });

  it("ignores requests that do not target a supported API route", () => {
    recordServerRequest(new Request("https://example.com/logs"));

    expect(getServerLogs()).toHaveLength(0);
  });
});
