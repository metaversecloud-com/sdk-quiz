<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Quiz Race

## Introduction / Summary

Quiz Race is a timed, multi-question quiz game for Topia worlds. A visitor clicks the **start asset** to open the drawer, presses **Start Quiz** to stamp `startTime`, then walks to each question zone — every question dropped-asset is a webhookZone that pops the drawer with that question's UI. Answering the last question stamps `endTime`, writes a score-plus-time entry to the key asset's leaderboard, and awards up to four badges. Admins configure the quiz in-drawer: quiz settings (replay, show-answer, timer, appearance, particles), then per-question editing across three question types (multiple choice, "select all that apply", open text). The app auto-drops the question and leaderboard assets on save.

The quiz is scoped per **`sceneDropId`** — a single world can host multiple independent Quiz Race instances by dropping the start asset in different scene drops. The world data object stores `{ [sceneDropId]: { keyAssetId } }` so every controller can find the right key asset from any dropped webhook.

## Key Features

### Canvas elements & interactions

- **Start asset (`uniqueName: "start"`):** the key asset. Its `webhookZoneEntered` webhook posts to `/api/iframe/start` and opens the drawer's Start page.
- **Question assets (`uniqueName: Quiz_question_${questionId}`):** dropped by the server on save; each is a landmark + webhook zone whose `webhookZoneEntered` posts to `/api/iframe/${questionId}` to open the corresponding question page.
- **Leaderboard asset (`uniqueName: Quiz_leaderboard`):** dropped by the server on first settings save; opens the Leaderboard page via `clickableLink` (drawer link, not a webhook).

### Drawer content

- **Start:** how-to-play, `PlayerStatus` progress (X / N answered, timer if enabled), `Start Quiz` / `Restart Quiz` CTA, and — for admins — an entry into the configure view.
- **Question:** the question text, optional media (image / video / link), answer input, and — if `settings.showCorrectAnswer` — instant correct/wrong feedback. Falls back to "Please go to the start zone" if the visitor has no `startTime`.
- **Leaderboard:** ranked table by score then time. Admins also see **View Results** (prints a full detail table in a new tab) and **Reset Quiz** (danger button; opens `ResetQuizModal`). A **Badges** tab shows badges owned vs still-locked.
- **Configure (admin):** two-tab editor — **Settings** (replay, show-correct-answer, timer, four asset-appearance pickers, particle selectors) and **Questions** (add / delete / edit per-question, live validation).
- **`NotConfigured`:** shown to visitors when a quiz has been dropped but not yet configured.

### Question types

| Type             | Client widget   | Correctness check                                                              |
| ---------------- | --------------- | ------------------------------------------------------------------------------ |
| `multipleChoice` | Radio buttons   | `selectedOption === answer` (option key match).                                |
| `allThatApply`   | Checkboxes      | Set equality: `selectedOptions` must exactly match `correctOptions[]`.         |
| `openText`       | Free-text input | Case-insensitive trimmed equality with `answer`. Server re-verifies on submit. |

Each question can also carry `mediaUrl` + `mediaType` (`image` / `video` / `link`) rendered above the answer input.

### Admin features

All `/admin/*` routes call `Visitor.get(...).isAdmin` and throw `"User is not an admin."` on failure. The configure view is the only place non-legacy quizzes get their questions.

- **Update settings** (`PUT /admin/update-settings`) — persists `QuizSettings`; on first save also drops the leaderboard asset, updates web-image layers on start/question/leaderboard assets when appearance changes, and stores `keyAssetId` into `world.dataObject[sceneDropId]`.
- **Save questions** (`PUT /admin/save-questions`) — validates every question (text present, ≥ 2 options for non-openText, correct-answer present); for new question IDs, drops a `Quiz_question_${id}` asset offset from the key asset and stores the mapping in `droppedAssets`.
- **Delete question** (`DELETE /admin/delete-question/:questionId`) — deletes the dropped asset, then renumbers remaining question IDs sequentially starting at `"1"`. Refuses to delete the last question.
- **Get particles** (`GET /admin/particles`) — feeds the particle-name dropdown in Settings.
- **Reset quiz** (`POST /admin/reset`) — clears the leaderboard and wipes each ranked profile's per-quiz visitor state.

## Required Assets with Unique Names

| Unique Name Pattern           | Placed by | Description                                                                                                                                                 |
| ----------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`                       | Manually  | The key asset (start button). Hosts the quiz `KeyAssetDataObject` (settings + questions + leaderboard). Its webhook must POST to `/api/iframe/start`.       |
| `Quiz_question_${questionId}` | The app   | One dropped asset per question. Landmark + webhookZone; webhook POSTs to `/api/iframe/${questionId}`.                                                       |
| `Quiz_leaderboard`            | The app   | Leaderboard viewer. `clickableLink` points at `/leaderboard` (opens in drawer). Dropped on first settings save; also looked up by uniqueName as a fallback. |

`handleOpenIframe` also accepts a legacy `uniqueName === "quiz-leaderboard"` (lowercase, hyphenated) to route into leaderboard mode.

## Technical Architecture

### Data Objects

#### Key Asset (`KeyAssetDataObject`)

Attached to the `"start"` dropped asset. Presence of `settings` marks the quiz as "configured".

```ts
{
  settings?: QuizSettings;                       // Absent = legacy quiz
  questions: {
    [questionId: string]: {
      questionText: string;
      questionType: "multipleChoice" | "allThatApply" | "openText";
      options: { [optionKey: string]: string };
      answer: string;                            // multipleChoice: option key; openText: exact string
      correctOptions?: string[];                 // allThatApply only
      mediaUrl?: string;
      mediaType?: "image" | "video" | "link";
    };
  };
  droppedAssets?: {
    [questionId: string]: string;                // -> droppedAssetId of the question zone
    leaderboard?: string;                        // -> droppedAssetId of the leaderboard asset
  };
  leaderboard: {
    // "displayName|score|timeElapsed|completionDate|questionsAnswered|attempts"
    // legacy: "displayName|score|timeElapsed"
    // timeout: attempts field is literal "Y"
    [profileId: string]: string;
  };
  results?: { ... };                             // Legacy — migrated to `leaderboard` on next GET /quiz
}
```

`QuizSettings`:

```ts
{
  assetAppearance: { startImage, questionMarkerImage, platformImage, leaderboardImage };
  correctAnswerParticle: string;                 // Default "brain_float"
  completionParticle: string;                    // Default "partyPopper_float"
  replayMode: "manual" | "never";
  showCorrectAnswer: boolean;
  timerEnabled: boolean;
  timerDurationMinutes?: number;                 // Absent = no time cap
}
```

#### Visitor (`VisitorDataObjectType`)

Keyed by `${urlSlug}-${sceneDropId}` so parallel scene drops in one world each get their own per-visitor state.

```ts
{
  [`${urlSlug}-${sceneDropId}`]: {
    answers: {
      [questionId]: {
        answer: string;
        selectedOptions?: string[];              // allThatApply
        isCorrect: boolean;
      };
    };
    timeElapsed: string;                         // "MM:SS"
    endTime: Date | null;                        // null until final answer or timeout
    startTime: Date | null;
  };
  totalQuizzesCompleted?: number;                // Lifetime; drives "Quiz Master" badge
  quizCompletions?: { [`${urlSlug}-${sceneDropId}`]: number };  // Per-quiz attempts
}
```

#### World (`WorldDataObjectType`)

Scene-drop → key-asset resolver used by every question-zone webhook.

```ts
{ [sceneDropId: string]: { keyAssetId: string } }
```

## API Endpoints

All routes mount under `/api`. Every non-webhook route calls `getCredentials(req.query)` which verifies `process.env.INTERACTIVE_KEY === query.interactivePublicKey`. `/api/iframe/:iframeId` reads credentials from `req.body`.

| Method   | Route                                | Auth    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/`                                  | —       | Sanity check.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `GET`    | `/system/health`                     | —       | Version + `NODE_ENV`, `INSTANCE_DOMAIN`, `INTERACTIVE_KEY`.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `GET`    | `/quiz`                              | —       | Full state: `{ isConfigured, leaderboard, quiz, visitor, visitorInventory, playerStatus, badges, settings }`. Resolves `keyAssetId` from world data object; migrates legacy `results` → `leaderboard`; fires `joins` public-key analytic when called from the start asset. Supports `?forceRefreshInventory=true`.                                                                                                                                                                        |
| `PUT`    | `/start`                             | —       | Stamps `startTime`, teleports the visitor to the start asset, fires `starts` analytic and `WorldActivityType.GAME_ON`.                                                                                                                                                                                                                                                                                                                                                                    |
| `POST`   | `/question/answer/:questionId`       | —       | Submits an answer. Body: `{ isCorrect, selectedOption, selectedOptions? }`. Server re-verifies `openText` and `allThatApply` (`isCorrect` from client is ignored for those types). On final question: computes score + `timeElapsed`, updates leaderboard **only** if strictly better (higher score, or same score with shorter time), triggers `completionParticle`, awards badges, sanitizes response (strips `answer` / `correctOptions` when `settings.showCorrectAnswer === false`). |
| `POST`   | `/quiz/timeout`                      | —       | Client-driven timeout call (enforced server-side via `startTime + timerDurationMinutes ± 5s`). Marks unanswered questions wrong, caps `timeElapsed` to the limit, writes leaderboard with `attempts = "Y"`. Fires `completions`, `timeouts`, `quizTimedOut`.                                                                                                                                                                                                                              |
| `GET`    | `/admin/particles`                   | Admin   | Lists ecosystem particle names for the settings dropdown.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `PUT`    | `/admin/save-questions`              | Admin   | Body: `{ questions, assetAppearance? }`. Validates, drops new question assets, updates existing questions. Single atomic `updateDataObject`.                                                                                                                                                                                                                                                                                                                                              |
| `DELETE` | `/admin/delete-question/:questionId` | Admin   | Deletes the dropped asset, renumbers remaining IDs from `"1"`. Refuses to delete the last question.                                                                                                                                                                                                                                                                                                                                                                                       |
| `PUT`    | `/admin/update-settings`             | Admin   | Body: `{ settings }`. Merges with existing or `DEFAULT_QUIZ_SETTINGS`; ensures leaderboard asset exists; updates web-image layers on assets when appearance changes; on first save initializes the full key-asset data object and writes `world.dataObject[sceneDropId].keyAssetId`.                                                                                                                                                                                                      |
| `POST`   | `/admin/reset`                       | Admin   | Wipes `leaderboard` on the key asset; for each ranked profile, resets that user's per-quiz visitor state to `defaultVisitorStatus`.                                                                                                                                                                                                                                                                                                                                                       |
| `POST`   | `/iframe/:iframeId`                  | Webhook | Called by Topia when a visitor enters a webhook zone. Routes to `start` / `leaderboard` / `question` in the drawer based on `iframeId` or `credentials.uniqueName`. Closes any prior iframe, then opens the new one.                                                                                                                                                                                                                                                                      |

## Analytics

Emitted via the SDK's `analytics: [...]` on `visitor.updateDataObject` / `keyAsset.updateDataObject` — except `joins`, which uses `visitor.updatePublicKeyAnalytics`. `uniqueKey` is `profileId` throughout.

| Event                           | Fired when                                                                                                              | Where                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `joins`                         | Visitor opens the start asset (`GET /quiz` with `isStartAsset=true`).                                                   | `handleGetQuiz`.                             |
| `starts`                        | Visitor presses **Start Quiz** (`PUT /start`).                                                                          | `handleStartQuiz`.                           |
| `question${questionId}Answered` | Any answer submission (per question ID).                                                                                | `handleAnswerQuestion`.                      |
| `completions`                   | Final question answered — fired even when the leaderboard isn't updated (existing better entry). Also fired on timeout. | `handleAnswerQuestion`, `handleTimeoutQuiz`. |
| `timeouts`                      | Quiz timer expires (`POST /quiz/timeout`).                                                                              | `handleTimeoutQuiz`.                         |
| `quizTimedOut`                  | Same event, on the visitor object (per-visitor tally).                                                                  | `handleTimeoutQuiz`.                         |
| `quizSettingsConfigured`        | Admin saves settings for the first time (initial `setDataObject`).                                                      | `handleUpdateSettings`.                      |
| `resets`                        | Admin resets the quiz.                                                                                                  | `handleResetQuiz`.                           |

A stubbed `addNewRowToGoogleSheets` util exists (`GOOGLESHEETS_*` env vars) but nothing in the codebase calls it — it's currently dead code.

## Badges

Granted via `awardBadge` (which uses `visitor.grantInventoryItem` + `visitor.fireToast`). Badge inventory items must exist in the ecosystem — names below must match exactly.

| Badge             | Trigger                                                                         | Where                   |
| ----------------- | ------------------------------------------------------------------------------- | ----------------------- |
| `Perfect Score`   | Final question answered and `score === numberOfQuestions`.                      | `handleAnswerQuestion`. |
| `Lightning Round` | Quiz finished with `durationMs <= 30_000`.                                      | `handleAnswerQuestion`. |
| `Quiz Master`     | Visitor's lifetime `totalQuizzesCompleted === 10` (exact threshold).            | `handleAnswerQuestion`. |
| `Top 3 Finisher`  | On completion, visitor's `profileId` is in the top 3 of the sorted leaderboard. | `handleAnswerQuestion`. |

## Environment Variables

Create a `.env` at the app root. See `.env-example` for a template.

| Variable                    | Description                                                                                                       | Required |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| `INTERACTIVE_KEY`           | Topia interactive app key. Verified against `interactivePublicKey` on every non-webhook request; checked at boot. | Yes      |
| `INTERACTIVE_SECRET`        | Topia interactive app secret. Checked at boot.                                                                    | Yes      |
| `INSTANCE_DOMAIN`           | Topia API domain (`api.topia.io` / `api-stage.topia.io`). Falls back to `api.topia.io`.                           | No       |
| `INSTANCE_PROTOCOL`         | Falls back to `https`.                                                                                            | No       |
| `API_KEY`                   | Optional API key passed to the SDK `Topia` constructor.                                                           | No       |
| `PORT`                      | Server port (defaults to `3000`).                                                                                 | No       |
| `NODE_ENV`                  | Toggles dev CORS, static-file serving of the client build, and verbose error logs.                                | No       |
| `NGROK_URL`                 | Ngrok tunnel URL for webhook + iframe callbacks during local development. Used when `NODE_ENV === "development"`. | No       |
| `WEB_IMAGE_ASSET_ID`        | Overrides the default `"webImageAsset"` used to drop question and leaderboard assets.                             | No       |
| `GOOGLESHEETS_SHEET_ID`     | Optional Google Sheets logging (util is defined but not currently wired into any controller).                     | No       |
| `GOOGLESHEETS_SHEET_RANGE`  | Sheet range for logging (default `Sheet1`).                                                                       | No       |
| `GOOGLESHEETS_CLIENT_EMAIL` | Service-account email for Google Sheets logging.                                                                  | No       |
| `GOOGLESHEETS_PRIVATE_KEY`  | Service-account private key for Google Sheets logging.                                                            | No       |

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the app root
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# create a .env at the app root (see Environment Variables above)
cp .env-example .env

# run the dev server (client + server together)
npm run dev
```

To exercise the app end-to-end you need the start / question / leaderboard assets placed in a Topia world, wired to the routes above. The reference scene lives at [https://topia.io/quiz-prod](https://topia.io/quiz-prod).

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### App-specific notes

- **Real-time transport:** none. No SSE, no websocket, no server-driven polling. The client refetches `GET /quiz` after each mutation; the timer is a client-side `setInterval` ticker (`components/Timer.tsx`) that calls `POST /quiz/timeout` when it hits zero. `handleTimeoutQuiz` re-verifies elapsed time server-side (5s network tolerance).
- **Scene-drop scoping:** every controller resolves the key asset by `worldDataObject[sceneDropId].keyAssetId`. This is written on first settings save and lazily backfilled by `handleGetQuiz` via `fetchDroppedAssetsBySceneDropId({ sceneDropId, uniqueName: "start" })`.
- **Legacy migration:** legacy quizzes (no `settings`, older `results` shape) are auto-migrated to the current `leaderboard` shape on the next `GET /quiz`. The `Question.questionType` field is optional in the client type to keep the legacy `{questionText, options, answer}` shape usable.
- **Leaderboard write-gating:** on completion, `handleAnswerQuestion` only overwrites a visitor's leaderboard row if the new score is strictly better _or_ equal score with strictly shorter time — but still fires the `completions` analytic either way.
- **Answer sanitization:** when `settings.showCorrectAnswer === false`, the `POST /question/answer/:questionId` response strips `answer` and `correctOptions` from each question in the returned quiz.
- **Server-side answer re-check:** `openText` and `allThatApply` correctness is recomputed server-side; the client-supplied `isCorrect` is only trusted for `multipleChoice`.
- **Ecosystem inventory cache** (`inventoryCache.ts`): 6-hour in-memory TTL with stale-fallback on error. `?forceRefreshInventory=true` on `GET /quiz` busts it.
- **`cleanReturnPayload` middleware** strips fields from every JSON response before send.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/quiz-dev), [Prod](https://topia.io/quiz-prod)
- [Notion One Pager](https://app.notion.com/p/topiaio/Quiz-Race-595190e694ac4d8ab893c16ff43184d9?v=71f6c3828d3b4f33960326f9bde24781)
