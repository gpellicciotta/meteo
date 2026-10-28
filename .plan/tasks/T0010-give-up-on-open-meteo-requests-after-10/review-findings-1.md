---
task: T0010
round: 1
verdict: rejected
reviewer: "@codex-2"
reviewed_at: 2026-10-28T17:00:02Z
reviewed_commit: "8c3157a"
base_commit: "529ba09"
branch: task/T0010-give-up-on-open-meteo-requests-after-10
---
# Review Findings: Task T0010 (Round 1)

## Summary
**[Decided]** Rejected because timeouts during response-body consumption bypass the specified network-error conversion.
The ten-second default, fetch cancellation, changelogs, and unchanged geolocation behavior otherwise match the declared scope.
All 34 unit tests and both browser scripts passed independently.

Command: `npm test -- --no-color`; exit code: 0.

```text
 Test Files  2 passed (2)
      Tests  34 passed (34)
   Start at  17:58:18
   Duration  597ms (tests 54%, import 25%, transform 12%, worker 8%)
```

Command: `npm run test:browser`; exit code: 0; execution session: `80239`.
Both scripts finished, including their internal browser and server cleanup.
Final output:

```text
ok - no condition scenario console, page or network errors
```

Command: `git diff --check main...HEAD`; exit code: 0; no output.

Command: `plan tasks validate .plan/tasks/T0010-give-up-on-open-meteo-requests-after-10.md`; exit code: 0.

```text
All 1 task file passed validation.
```

## Defects
- P2: Body timeouts escape the conversion in `getJson` ([weather-api.js](../../../js/weather-api.js), lines 49-59).
  Fetch resolves when headers arrive, but `res.json()` executes outside the catch block.
  A body that stalls past the deadline therefore rejects with a native exception instead of `ForecastError("network")`.
  Both public functions violate the timeout-error contract in [technical-spec.md](technical-spec.md).
  The current UI still displays its network message through its unknown-error fallback; this finding concerns the API contract.

Independent reproduction used a local HTTP server that immediately returned status 200 and an incomplete JSON body containing `{`.
The server kept the body open; native fetch received the implementation's abort signal and a 100-millisecond test timeout.
Both calls terminated, but neither returned the required error code.
The inline Node process exited 0 and closed all connections and its server.
Observed output:

```text
{"request":"searchPlaces","name":"TimeoutError","code":23,"message":"The operation was aborted due to timeout","expectedCode":"network"}
{"request":"fetchForecast","name":"TimeoutError","code":23,"message":"The operation was aborted due to timeout","expectedCode":"network"}
```

## Process Gaps
The added regression tests cover requests stalled before headers, leaving the response-body timeout path untested.
Recorded TDD evidence and the declared integration checks otherwise satisfy the task's verification requirements.

## Required Rework
- Add failing regression cases for both public functions where headers resolve immediately and body consumption rejects on timeout.
- Convert body-consumption timeout failures to `ForecastError("network")`, preserving existing HTTP error behavior.
- Rerun unit and browser checks, and update the verification evidence and generated service worker.
