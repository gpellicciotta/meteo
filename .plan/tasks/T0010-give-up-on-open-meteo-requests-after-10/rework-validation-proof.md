# T0010 Review Rework Validation

## Walkthrough & Validation
### Failing body-timeout regressions
Command: `npm test -- --no-color`; exit code: 1 before implementation.

```text
[... 7 lines omitted ...]
 ❯ tests/forecast.test.js (27 tests | 2 failed) 199ms
   ❯ weather API client (10)
     × maps searchPlaces body timeouts to the network error 48ms
     × maps fetchForecast body timeouts to the network error 32ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/forecast.test.js > weather API client > maps searchPlaces body timeouts to the network error
 FAIL  tests/forecast.test.js > weather API client > maps fetchForecast body timeouts to the network error
AssertionError: expected DOMException{ stack: 'TimeoutError: …' } to match object { name: 'ForecastError', …(1) }

- Expected
+ Received

- {
-   "code": "network",
-   "name": "ForecastError",
+ TimeoutError {
+   "message": "The operation was aborted due to timeout",
  }

 ❯ tests/forecast.test.js:216:39
    214|       }),
    215|     });
    216|     await expect(request(stalledBody)).rejects.toMatchObject({ name: "…
       |                                       ^
    217|   });
    218|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  2 failed | 35 passed (37)
   Start at  18:01:16
   Duration  598ms (tests 60%, transform 23%, import 13%, worker 4%)
```

### Passing unit suite
Command: `npm test -- --no-color`; exit code: 0 after implementation.

```text
[... 7 lines omitted ...]

 Test Files  2 passed (2)
      Tests  37 passed (37)
   Start at  18:01:33
   Duration  1.16s (tests 57%, transform 20%, import 16%, worker 6%)
```

### Browser verification
Command: `npm run test:browser`; exit code: 0; execution session: `90804`.

```text
[... 93 lines omitted ...]
ok - rain icon follows the Dutch language switch
ok - condition 0/0 preserves the summary text
ok - condition 0/0 renders clear-night
ok - refresh replaces the previous condition icon
ok - condition 0/1 preserves the summary text
ok - condition 0/1 renders clear-day
ok - refresh replaces the previous condition icon
ok - condition 2/0 preserves the summary text
ok - condition 2/0 renders partly-night
ok - refresh replaces the previous condition icon
ok - condition 2/1 preserves the summary text
ok - condition 2/1 renders partly-day
ok - refresh replaces the previous condition icon
ok - condition 3/1 preserves the summary text
ok - condition 3/1 renders cloudy
ok - refresh replaces the previous condition icon
ok - condition 45/1 preserves the summary text
ok - condition 45/1 renders fog
ok - refresh replaces the previous condition icon
ok - condition 71/1 preserves the summary text
ok - condition 71/1 renders snow
ok - refresh replaces the previous condition icon
ok - condition 95/1 preserves the summary text
ok - condition 95/1 renders thunder
ok - refresh replaces the previous condition icon
ok - condition null/1 preserves the summary text
ok - condition null/1 omits the icon
ok - icon adds no summary line at 390px
ok - condition 999/1 preserves the summary text
ok - condition 999/1 omits the icon
ok - icon adds no summary line at 390px
ok - condition 0/null preserves the summary text
ok - condition 0/null omits the icon
ok - icon adds no summary line at 390px
ok - no condition scenario console, page or network errors
```

The existing HTTP 500 scenario exempts its intentional errors. All remaining console, page, and network checks passed.
Both scripts closed their browsers and local servers.

### Native fetch body verification
The local server sent successful headers and incomplete JSON, then left each response open.
The initial 100-millisecond timeout expired before headers arrived; the smoke assertion correctly rejected that insufficient setup.
Initial command; exit code: 1:

```powershell
node --input-type=module -e 'import { createServer } from "node:http"; import assert from "node:assert/strict"; import { searchPlaces, fetchForecast } from "./js/weather-api.js"; const server = createServer((_req, res) => { res.writeHead(200, { "Content-Type": "application/json" }); res.write("{"); }); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)); try { for (const [name, request] of [["searchPlaces", (fetchImpl) => searchPlaces("Gent", "en", fetchImpl, 100)], ["fetchForecast", (fetchImpl) => fetchForecast(0, 0, fetchImpl, 100)]]) { let receivedHeaders = false; const localFetch = async (_url, options) => { const response = await fetch("http://127.0.0.1:" + server.address().port, options); receivedHeaders = true; return response; }; await assert.rejects(request(localFetch), { name: "ForecastError", code: "network" }); assert.equal(receivedHeaders, true); console.log("ok - " + name + " maps native fetch body timeout to network"); } } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }'
```

```text
node:internal/modules/run_main:122
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

false !== true

[... 10 lines omitted ...]
```

The one-second test timeout allowed headers to arrive and verified both public functions against stalled native response bodies.
Final command; exit code: 0:

```powershell
node --input-type=module -e 'import { createServer } from "node:http"; import assert from "node:assert/strict"; import { searchPlaces, fetchForecast } from "./js/weather-api.js"; const server = createServer((_req, res) => { res.writeHead(200, { "Content-Type": "application/json" }); res.write("{"); }); await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)); try { for (const [name, request] of [["searchPlaces", (fetchImpl) => searchPlaces("Gent", "en", fetchImpl, 1000)], ["fetchForecast", (fetchImpl) => fetchForecast(0, 0, fetchImpl, 1000)]]) { let receivedHeaders = false; const localFetch = async (_url, options) => { const response = await fetch("http://127.0.0.1:" + server.address().port, options); receivedHeaders = true; return response; }; await assert.rejects(request(localFetch), { name: "ForecastError", code: "network" }); assert.equal(receivedHeaders, true); console.log("ok - " + name + " maps native fetch body timeout to network"); } } finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }'
```

```text
ok - searchPlaces maps native fetch body timeout to network
ok - fetchForecast maps native fetch body timeout to network
```

Both runs closed all local connections and the HTTP server in a `finally` block.

