import { createFileRoute } from "@tanstack/react-router";

import { getServerLogs } from "@/lib/server-logs";

export const Route = createFileRoute("/logs")({
  loader: ({ location }) => {
    const sort = location.search?.sort;
    const logs = getServerLogs();
    const sortedLogs = sort === "desc" ? [...logs].reverse() : logs;

    return { logs: sortedLogs };
  },
  component: LogsPage,
});

function LogsPage() {
  const { logs } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Server logs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recent requests captured by the server, including method, path, query parameters,
            and a formatted timestamp.
          </p>
        </header>

        {logs.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            No requests have been logged yet.
          </div>
        ) : (
          <pre className="overflow-auto rounded-lg border bg-muted p-4 text-xs whitespace-pre-wrap">
            {JSON.stringify(logs, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
