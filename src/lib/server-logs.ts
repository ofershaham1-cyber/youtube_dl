type ServerLogEntry = {
  id: number;
  timestamp: string;
  method: string;
  pathname: string;
  searchParams: Record<string, string>;
  userAgent: string;
};

const serverLogs: ServerLogEntry[] = [];
let nextLogId = 1;

const availableApiRoutes = new Set([
  "/api/subtitles",
  "/api/video-info",
  "/api/transcript-supported-languages",
  "/api/default-transcript-languages",
  "/api/translate-transcript",
  "/api/openapi.json",
]);

function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

export function recordServerRequest(request: Request): void {
  const url = new URL(request.url);

  if (!availableApiRoutes.has(url.pathname)) {
    return;
  }

  const searchParams = Object.fromEntries(url.searchParams.entries());

  serverLogs.push({
    id: nextLogId++,
    timestamp: formatTimestamp(new Date()),
    method: request.method,
    pathname: url.pathname,
    searchParams,
    userAgent: request.headers.get("user-agent") ?? "unknown",
  });
}

export function getServerLogs(): ServerLogEntry[] {
  return [...serverLogs];
}

export function clearServerLogs(): void {
  serverLogs.length = 0;
  nextLogId = 1;
}

export type { ServerLogEntry };
