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

## How it works

- Each test gets its own world (`urlSlug`) in the mock, so tests run fully in parallel.
- `fixtures.ts` → `world.seed({...})` sets up the quiz (admin or player, in/out of zone, questions,
  settings, leaderboard, player progress) and `world.url("start" | "question" | "leaderboard")` builds the
  iframe URL with the session credentials Topia normally appends.
- Assertions check both the UI and what the app wrote back to Topia (`world.keyAssetData()`,
  `world.playerStatus()`, `world.state().events` for particles, badges, teleports, webhooks, deletes).
- If the app starts calling a public-API endpoint the mock doesn't implement, the mock logs
  `[mock-topia] unhandled ...` and returns 501.

## Coverage

| Spec | Covers |
|---|---|
| `admin.spec.ts` | not-live state, first-time setup (settings → leaderboard asset → first question asset + webhook), validation errors, adding each question type, editing, deleting + renumbering, settings |
| `player.spec.ts` | start + teleport, timer timeout, not-started / outside-zone guards, right and wrong answers for all three question types, answer lock on revisit, server-side re-grading, hidden answers not leaked, completion (leaderboard, particles, badges), replay on/off |
| `leaderboard.spec.ts` | empty state, ranking, admin reset, badges tab |
