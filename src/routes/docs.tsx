import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

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
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const loadSwaggerUI = () => {
      try {
        if (window.SwaggerUIBundle) {
          window.ui = window.SwaggerUIBundle({
            url: "/api/openapi.json",
            dom_id: "#swagger-ui",
            deepLinking: true,
            presets: [window.SwaggerUIBundle.presets.apis],
          });
        } else {
          console.warn("SwaggerUIBundle is not available");
        }
      } catch (error) {
        console.error("Failed to initialize Swagger UI:", error);
      }
    };

    // Check if SwaggerUIBundle is already loaded
    if (window.SwaggerUIBundle) {
      loadSwaggerUI();
    } else {
      // Load the script dynamically
      const script = document.createElement("script");
      script.src = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js";
      script.onload = loadSwaggerUI;
      script.onerror = () => {
        console.error("Failed to load Swagger UI script");
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div id="swagger-ui" />
    </div>
  );
}