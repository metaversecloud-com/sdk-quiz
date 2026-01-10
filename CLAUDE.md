# SDK Quiz - Claude Development Guidelines

This document provides Claude-specific guidelines for working with this Topia SDK Quiz application.

## Project Context

- **Stack**: React + TypeScript (client), Node + Express (server)
- **SDK**: JavaScript RTSDK - Topia Client Library (@rtsdk/topia)
- **App Type**: Timed racing quiz game with zones
- **SDK Documentation**: https://metaversecloud-com.github.io/mc-sdk-js/index.html

## Application Overview

SDK Quiz is a timed quiz game where players:
1. Click a "Start" asset to begin the quiz
2. Answer questions by clicking answer zone assets
3. Race to complete all questions
4. View leaderboards and completion times

---

## Interactive Keys & Authentication

### Key Types

| Key | Storage | Purpose |
|-----|---------|---------|
| `INTERACTIVE_KEY` (publicKey) | `.env`, passed to clients | Identifies the app, linked to assets |
| `INTERACTIVE_SECRET` (secretKey) | `.env` only, **never expose** | Signs JWTs for API authentication |
| `API_KEY` | `.env` only | Optional admin-level access |

### How Interactive Keys Work

```
Developer Setup (topia-gateway):
┌─────────────────────────────────────────────────────────────────┐
│ 1. Developer creates Interactive Key in topia-gateway           │
│    → Generates: publicKey (Firestore doc ID)                    │
│    → Generates: secretKey (base64-encoded UUID)                 │
│ 2. Developer links key to quiz assets in topia-client           │
│    - Start asset (triggers quiz start)                          │
│    - Answer zone assets (clickable answers)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
Runtime (when user clicks asset):
┌─────────────────────────────────────────────────────────────────┐
│ 1. Topia generates interactiveNonce (session-specific)          │
│ 2. Topia opens iframe with credentials OR triggers webhook      │
│ 3. SDK app extracts credentials, signs JWT with secretKey       │
│ 4. public-api validates JWT signature + nonce                   │
└─────────────────────────────────────────────────────────────────┘
```

### JWT Signing Process

The SDK automatically signs requests using the `interactiveSecret`:

```typescript
// Inside SDK (SDKController.ts) - happens automatically
const payload = {
  interactiveNonce,  // Session nonce from Topia
  visitorId,         // Current visitor
  assetId,           // Asset that was clicked
  urlSlug,           // Current world
  profileId,         // User's global profile
  date: new Date(),  // Timestamp
};
const jwt = jwt.sign(payload, topia.interactiveSecret);

// JWT sent as header: InteractiveJWT
// Public key sent as header: PublicKey
```

### Server Initialization

**File:** `server/utils/topiaInit.ts`

```typescript
import { Topia, DroppedAssetFactory, VisitorFactory, WorldFactory } from "@rtsdk/topia";

const topia = new Topia({
  apiDomain: process.env.INSTANCE_DOMAIN,
  apiProtocol: process.env.INSTANCE_PROTOCOL,
  apiKey: process.env.API_KEY,
  interactiveKey: process.env.INTERACTIVE_KEY,
  interactiveSecret: process.env.INTERACTIVE_SECRET,
});

export const DroppedAsset = new DroppedAssetFactory(topia);
export const Visitor = new VisitorFactory(topia);
export const World = new WorldFactory(topia);
```

---

## Platform-to-App Communication

SDK apps are **external applications** that you build and host. Topia communicates with your app via two mechanisms:

### Iframes (Start Button UI)

When a user clicks the quiz start asset, Topia opens your app in an **iframe drawer**:

```
User clicks "Start Quiz" asset → Topia opens iframe with credentials
                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ YOUR QUIZ APP (React frontend in iframe)                        │
│                                                                 │
│ URL: https://your-app.com/?visitorId=123&assetId=xyz&...        │
│                                                                 │
│ • Display quiz questions and answers                            │
│ • Show timer and progress                                       │
│ • Submit answers to your backend                                │
└─────────────────────────────────────────────────────────────────┘
```

### Webhooks (Answer Zones)

Answer zone assets trigger **webhooks** to your backend when clicked:

```
User walks into answer zone → Topia POSTs to your backend
                                   ↓
POST https://your-app.com/api/answer
Body: { visitorId, interactiveNonce, assetId, urlSlug, ... }
```

**Quiz uses both:**
- **Iframe**: Start button → shows quiz UI
- **Webhook**: Answer zones → records answer without showing UI

---

## Session Credentials

### Credential Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `visitorId` | number | User's visitor ID in this world |
| `interactiveNonce` | string | One-time session token (validates in Redis) |
| `interactivePublicKey` | string | Your app's public key |
| `urlSlug` | string | Current world's URL slug |
| `profileId` | string | User's global profile ID |
| `assetId` | string | The clicked asset's ID |
| `sceneDropId` | string | Scene drop identifier (used for per-quiz tracking) |
| `isStartAsset` | boolean | Whether clicked asset is the start asset |

### Webhook vs Iframe

This app supports **both** webhooks and iframes:

**Webhook Flow (answer zones):**
```typescript
// Credentials come in req.body (POST)
const credentials = getCredentials(req.body);
```

**Iframe Flow (start button):**
```typescript
// Credentials come in req.query (GET)
const credentials = getCredentials(req.query);
```

### Server-Side Extraction

**File:** `server/utils/getCredentials.ts`

```typescript
export const getCredentials = (query: any): Credentials => {
  const requiredFields = ["interactiveNonce", "interactivePublicKey", "urlSlug", "visitorId"];
  const missingFields = requiredFields.filter((f) => !query[f]);
  if (missingFields.length > 0) {
    throw `Missing required parameters: ${missingFields.join(", ")}`;
  }

  if (process.env.INTERACTIVE_KEY !== query.interactivePublicKey) {
    throw "Provided public key does not match";
  }

  // Quiz-specific: convert isStartAsset string to boolean
  const isStartAsset = ["true", "1"].includes(query.isStartAsset?.toLowerCase());

  return {
    assetId: query.assetId as string,
    visitorId: Number(query.visitorId),
    interactiveNonce: query.interactiveNonce as string,
    interactivePublicKey: query.interactivePublicKey as string,
    urlSlug: query.urlSlug as string,
    profileId: query.profileId as string,
    sceneDropId: query.sceneDropId as string,
    isStartAsset,
    // ... other fields
  };
};
```

---

## Dropped Assets

### Key Asset (Quiz Configuration)

The "key asset" stores quiz questions and configuration:

**File:** `server/utils/droppedAssets/initializeKeyAssetDataObject.ts`

```typescript
// Fetch and initialize the key asset's data object
await keyAsset.fetchDataObject();

if (!keyAsset?.dataObject?.questions) {
  const lockId = `${keyAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
  await keyAsset.setDataObject(
    { questions: getDefaultQuestions(4) },
    { lock: { lockId } }
  );
}
```

**Data Object Structure:**
```typescript
interface KeyAssetDataObject {
  questions: {
    questionId: string;
    text: string;
    answers: { id: string; text: string; isCorrect: boolean }[];
  }[];
}
```

### World Activity Triggers

The quiz uses world activity to trigger visual effects:

```typescript
import { WorldActivityType } from "@rtsdk/topia";

const world = World.create(urlSlug, { credentials });
world.triggerActivity({ type: WorldActivityType.GAME_ON, assetId });
```

---

## Data Object Patterns

### Visitor Data Object (Player Progress)

Player progress is stored on the visitor's data object, scoped by `urlSlug-sceneDropId`:

```typescript
// server/controllers/handleStartQuiz.ts
const playerStatus = {
  answers: {},
  endTime: null,
  startTime: now,
  username,
};

await visitor.updateDataObject(
  { [`${urlSlug}-${sceneDropId}`]: playerStatus },
  {
    analytics: [
      {
        analyticName: "starts",
        profileId,
        uniqueKey: profileId,
        urlSlug,
      },
    ],
  },
);
```

### Answer Tracking

```typescript
// Track each answer
await visitor.updateDataObject(
  { [`${urlSlug}-${sceneDropId}`]: { answers: { [questionId]: answerId } } },
  {
    analytics: [
      {
        analyticName: `question${questionId}Answered`,
        profileId,
        uniqueKey: profileId,
        urlSlug,
      },
    ],
  },
);
```

---

## Architecture & Data Flow

1. **Server-First Architecture**: All SDK calls happen in server routes/controllers
2. **API Flow**: UI → `client/backendAPI.ts` → server routes → Topia SDK
3. **Protected Files**: Do not modify `client/App.tsx`, `backendAPI.ts`, `getCredentials.ts`

### Key Controllers

| Controller | Purpose |
|------------|---------|
| `handleStartQuiz.ts` | Initialize player status, fetch quiz questions |
| `handleUpdateQuestion.ts` | Record answer, check correctness |
| `handleResetQuiz.ts` | Reset player progress |

---

## Backend Validation

When requests are made, Topia's `public-api` validates:

1. **JWT Signature**: Verifies JWT was signed with the correct `secretKey`
2. **Nonce Validation**: Checks `interactiveNonce` matches Redis
3. **Asset Configuration**: Confirms asset has `isInteractive=true` and matching `interactivePublicKey`

---

## Environment Setup

```env
API_KEY=your_api_key_here
INTERACTIVE_KEY=your_interactive_key_here
INTERACTIVE_SECRET=your_interactive_secret_here
INSTANCE_DOMAIN=api.topia.io
INSTANCE_PROTOCOL=https
```

---

## Key Source Paths

| Path | Purpose |
|------|---------|
| `server/utils/topiaInit.ts` | SDK initialization |
| `server/utils/getCredentials.ts` | Credential extraction |
| `server/utils/droppedAssets/initializeKeyAssetDataObject.ts` | Quiz data initialization |
| `server/controllers/handleStartQuiz.ts` | Start quiz handler |
| `server/controllers/handleUpdateQuestion.ts` | Answer submission |
| `server/types/KeyAssetTypes.ts` | Quiz data types |
| `server/types/VisitorDataObjectType.ts` | Player progress types |

---

## Key References

- **SDK Documentation**: https://metaversecloud-com.github.io/mc-sdk-js/index.html
- **Topia Stack Docs**: See `CLAUDE.md` files in parent directories
