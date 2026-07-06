# E2E Page Stability Test

This test ensures the application remains functional and responsive for a specified duration.

## What It Tests

The e2e test (`e2e-page-stability.test.ts`) validates:

1. **Continuous Functionality** - The page remains healthy for 10 seconds
   - Checks server health every 1 second
   - Tests API endpoint availability and response times
   - Ensures at least 80% success rate

2. **Concurrent Request Handling** - Multiple simultaneous API calls
   - Makes 5 batches of concurrent requests
   - Each batch contains 3 requests to random endpoints
   - Verifies no degradation under load

## Running the Test

### Prerequisites
Make sure your dev server is running:
```bash
npm run dev
```

The test auto-detects the dev server on common ports (5173, 8080, 8081, 8082, 3000).

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run All Tests
```bash
npm test
```

## Configuration

Edit the test file to adjust:

- **`TEST_DURATION_SECONDS`** - How long to test (default: 10 seconds)
- **`POLL_INTERVAL_MS`** - Check frequency (default: every 1 second)
- **`API_ENDPOINTS`** - Which endpoints to monitor

## Example Output

```
📊 Testing page stability at http://localhost:5173 for 10 seconds...
⏱️  [0s] Check #1 - Server: ✓ - API: 200, 200
⏱️  [1s] Check #2 - Server: ✓ - API: 200, 200
⏱️  [2s] Check #3 - Server: ✓ - API: 200, 200
...
📈 Stability Report:
   Total checks: 11
   Successful checks: 11
   Success rate: 100.00%
   Average response times:
     /api/transcript-supported-languages: 45.23ms
     /api/default-transcript-languages: 38.91ms
```

## Assertions

The test passes when:
- ✓ At least one check succeeds
- ✓ Success rate is ≥ 80%
- ✓ Average response times are < 5 seconds
- ✓ All concurrent requests have ≥ 2/3 success rate

## Use Cases

- **CI/CD pipelines** - Add to your GitHub Actions to catch performance regressions
- **Load testing** - Increase duration and concurrent requests for stress testing
- **Deployment validation** - Run before/after deployments to verify stability
- **Debugging** - Monitor response times and identify bottlenecks
