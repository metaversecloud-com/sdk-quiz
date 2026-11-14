# sdk-quiz e2e tests

Playwright tests that drive the real quiz app (production build of `client/` + `server/`) in a browser.
The server's `@rtsdk/topia` calls go to `mock-topia/server.mjs`, an in-memory fake of the Topia public API,
so no Topia credentials, world, or network access are needed.

## Run

```bash
npm install --prefix ..        # app deps, if not installed yet
cd e2e
npm install
npx playwright install chromium
npm test                       # builds the app, starts both servers, runs all specs
npm run test:ui                # interactive mode
```

Ports: app `3100`, mock `3101` (override with `APP_PORT` / `MOCK_TOPIA_PORT`).
Locally, already-running servers on those ports are reused; with `CI=1` they're always started fresh.

## Run against a Docker image (e.g. a Node upgrade)

`npm test` runs the app on your local Node. To test what actually ships, run the suite against the
container image instead:

```bash
nvm use 24                              # build on the same Node as the image, like CI does
e2e/scripts/test-image.sh 24            # from the repo root; extra args go to Playwright
```

The script builds the app, runs `docker build --build-arg NODE_VERSION=24`, refuses to continue if the
image's Node isn't 24 (a hardcoded `FROM` tag would otherwise test the wrong version), then runs the suite
with `E2E_APP_IMAGE` set so Playwright starts the container instead of local Node. Needs Docker running.

Without a version (`e2e/scripts/test-image.sh`) it tests the image exactly as the Dockerfile builds it.

## CI

- **Every PR push** runs the `E2E` job (`.github/workflows/e2e.yml`): the app built on `vars.node_version`,
  the image as the Dockerfile builds it, the full suite against the container. `E2E` is a required check,
  so the PR can't merge while it's running or failing. A newer push cancels the older run. The Playwright
  report is uploaded as the `playwright-report` artifact.
- **Manual Node comparison**: Actions → E2E tests → Run workflow, with `node_versions` such as
  `["22", "24"]`; reports land in `playwright-report-node<version>`. GitHub only lists the manual trigger
  once the workflow is on the default branch (`main`).

## How it works

- Each test gets its own world (`urlSlug`) in the mock, so tests run fully in parallel.
- `fixtures.ts` → `world.seed({...})` sets up the quiz (admin or player, in/out of zone, questions,
  settings, leaderboard, player progress) and `world.url("start" | "question" | "leaderboard")` builds the
  iframe URL with the session credentials Topia normally appends.
- Assertions check both the UI and what the app wrote back to Topia (`world.keyAssetData()`,
  `world.playerStatus()`, `world.state().events` for particles, badges, teleports, webhooks, deletes).
- If the app starts calling a public-API endpoint the mock doesn't implement, the mock logs
  `[mock-topia] unhandled ...`, returns 501, and the test that triggered it fails.

## Coverage

| Spec | Covers |
|---|---|
| `admin.spec.ts` | not-live state, first-time setup (settings → leaderboard asset → first question asset + webhook), validation errors, adding each question type, editing, deleting + renumbering, settings |
| `player.spec.ts` | start + teleport, timer timeout, not-started / outside-zone guards, right and wrong answers for all three question types, answer lock on revisit, server-side re-grading, hidden answers not leaked, completion (leaderboard, particles, badges), replay on/off |
| `leaderboard.spec.ts` | empty state, ranking, admin reset, badges tab |
| `security.spec.ts` | admin endpoints reject players, wrong public key, timeout can't end a quiz early, answer integrity |
| `rules.spec.ts` | replays keep the best result, timeouts, Quiz Master / owned-badge / 4th-place badge rules, reset player starts fresh, particles set to None |

Tests for bugs that still exist are marked `test.fail(true, "EXP-…")`: they pass while the bug is there and
fail once it's fixed, so the marker is removed in the same PR as the fix.

Every test also fails if the app calls a public-API endpoint `mock-topia` doesn't implement, so an
`@rtsdk/topia` upgrade that starts using new endpoints can't pass silently.
