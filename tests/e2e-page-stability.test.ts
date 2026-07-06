import { describe, it, expect, beforeAll } from "vitest";

/**
 * E2E test that ensures the page functions correctly for a specified duration.
 * This test simulates continuous user interaction and API calls to verify stability.
 */

const TEST_DURATION_SECONDS = 10; // Duration to test stability
const POLL_INTERVAL_MS = 1000; // How often to check (every 1 second)
const API_ENDPOINTS = [
  "/api/transcript-supported-languages?videoID=dQw4w9WgXcQ",
  "/api/default-transcript-languages?videoID=dQw4w9WgXcQ",
];

// Helper function to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to check if server is responding
const checkServerHealth = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(baseUrl);
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
};

// Helper function to test API endpoints
const testApiEndpoints = async (
  baseUrl: string,
): Promise<{ endpoint: string; status: number; responseTime: number }[]> => {
  const results = [];

  for (const endpoint of API_ENDPOINTS) {
    const startTime = performance.now();
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const responseTime = performance.now() - startTime;
      results.push({
        endpoint,
        status: response.status,
        responseTime,
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 0,
        responseTime: performance.now() - startTime,
      });
    }
  }

  return results;
};

describe("Page Stability E2E Tests", () => {
  let baseUrl = "http://localhost:5173"; // Default Vite dev server

  // Try to detect the actual dev server port
  beforeAll(async () => {
    const possiblePorts = [5173, 8080, 8081, 8082, 3000];

    for (const port of possiblePorts) {
      const url = `http://localhost:${port}`;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (response.ok || response.status < 500) {
          baseUrl = url;
          console.log(`✓ Found dev server at ${baseUrl}`);
          break;
        }
      } catch {
        // Port not responding, try next
      }
    }
  });

  it(`should remain functional for ${TEST_DURATION_SECONDS} seconds`, async () => {
    const startTime = Date.now();
    const endTime = startTime + TEST_DURATION_SECONDS * 1000;
    const results: {
      timestamp: number;
      healthy: boolean;
      endpoints: { endpoint: string; status: number; responseTime: number }[];
    }[] = [];
    let checksPerformed = 0;
    let successfulChecks = 0;

    console.log(
      `\n📊 Testing page stability at ${baseUrl} for ${TEST_DURATION_SECONDS} seconds...`,
    );

    while (Date.now() < endTime) {
      const healthy = await checkServerHealth(baseUrl);
      const endpoints = await testApiEndpoints(baseUrl);

      results.push({
        timestamp: Date.now() - startTime,
        healthy,
        endpoints,
      });

      checksPerformed++;
      if (healthy && endpoints.every((e) => e.status === 200)) {
        successfulChecks++;
      }

      // Log progress
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(
        `⏱️  [${elapsed}s] Check #${checksPerformed} - Server: ${healthy ? "✓" : "✗"} - API: ${endpoints.map((e) => e.status).join(", ")}`,
      );

      await sleep(POLL_INTERVAL_MS);
    }

    // Analyze results
    const successRate = (successfulChecks / checksPerformed) * 100;
    const avgResponseTimes = API_ENDPOINTS.map((endpoint) => {
      const times = results
        .flatMap((r) => r.endpoints)
        .filter((e) => e.endpoint === endpoint)
        .map((e) => e.responseTime);
      const avg = times.reduce((a, b) => a + b, 0) / times.length || 0;
      return { endpoint, avg };
    });

    console.log("\n📈 Stability Report:");
    console.log(`   Total checks: ${checksPerformed}`);
    console.log(`   Successful checks: ${successfulChecks}`);
    console.log(`   Success rate: ${successRate.toFixed(2)}%`);
    console.log(`   Average response times:`);
    avgResponseTimes.forEach((item) => {
      console.log(`     ${item.endpoint}: ${item.avg.toFixed(2)}ms`);
    });

    // Assertions
    expect(checksPerformed).toBeGreaterThan(0);
    expect(successfulChecks).toBeGreaterThan(0);
    expect(successRate).toBeGreaterThanOrEqual(80); // At least 80% success rate
    expect(results.every((r) => r.healthy || r.endpoints.length === 0)).toBe(
      true,
    );

    // Verify response times are reasonable (less than 5 seconds)
    avgResponseTimes.forEach((item) => {
      expect(item.avg).toBeLessThan(5000);
    });
  }, 60000); // 60 second timeout for the test itself

  it("should handle concurrent API requests without degradation", async () => {
    const concurrentRequests = 5;
    const requestsPerConcurrent = 3;
    const results: {
      concurrent: number;
      avgResponseTime: number;
      successCount: number;
    }[] = [];

    console.log("\n🔄 Testing concurrent request handling...");

    for (let i = 0; i < concurrentRequests; i++) {
      const startTime = performance.now();
      const promises = [];

      for (let j = 0; j < requestsPerConcurrent; j++) {
        const endpoint =
          API_ENDPOINTS[Math.floor(Math.random() * API_ENDPOINTS.length)];
        promises.push(
          fetch(`${baseUrl}${endpoint}`)
            .then((r) => r.status === 200)
            .catch(() => false),
        );
      }

      const responses = await Promise.all(promises);
      const avgResponseTime =
        (performance.now() - startTime) / requestsPerConcurrent;
      const successCount = responses.filter(Boolean).length;

      results.push({
        concurrent: i + 1,
        avgResponseTime,
        successCount,
      });

      console.log(
        `   Batch ${i + 1}: ${successCount}/${requestsPerConcurrent} successful, avg ${avgResponseTime.toFixed(2)}ms/request`,
      );

      await sleep(500);
    }

    // Verify all concurrent batches had high success rate
    expect(results.every((r) => r.successCount >= 2)).toBe(true);
    expect(results.some((r) => r.successCount === requestsPerConcurrent)).toBe(
      true,
    );
  }, 30000);
});
