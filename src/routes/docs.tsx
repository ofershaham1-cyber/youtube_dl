import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Docs — DownSub Subtitle API" },
      { name: "description", content: "Swagger UI for the DownSub subtitle API." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css",
      },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const bootstrap = `
    (function () {
      function init() {
        window.ui = window.SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [window.SwaggerUIBundle.presets.apis],
        });
      }
      if (window.SwaggerUIBundle) init();
      else {
        var s = document.createElement('script');
        s.src = 'https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js';
        s.onload = init;
        document.head.appendChild(s);
      }
    })();
  `;
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div id="swagger-ui" />
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
    </div>
  );
}