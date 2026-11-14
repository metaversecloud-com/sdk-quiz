import { APIRequestContext, Page, test as base, expect } from "@playwright/test";
import { INTERACTIVE_KEY, MOCK_TOPIA_URL } from "./constants";

export const KEY_ASSET_ID = "key-asset";
export const LEADERBOARD_ASSET_ID = "leaderboard-asset";
export const SCENE_DROP_ID = "scene-1";
export const VISITOR_ID = 42;
export const questionAssetId = (questionId: string) => `question-asset-${questionId}`;

export type Question = {
  questionText: string;
  questionType: "multipleChoice" | "allThatApply" | "openText";
  options: Record<string, string>;
  answer: string;
  correctOptions?: string[];
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
};

export type PlayerStatus = {
  answers: Record<string, { answer: string; selectedOptions?: string[]; isCorrect: boolean }>;
  startTime: string | null;
  endTime: string | null;
  timeElapsed: string;
};

export const DEFAULT_SETTINGS = {
  assetAppearance: {
    startImage: "https://sdk-quiz.s3.us-east-1.amazonaws.com/start_1.png",
    questionMarkerImage: "https://sdk-quiz.s3.us-east-1.amazonaws.com/questionMarker_1.png",
    platformImage: "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_1.png",
    leaderboardImage: "https://sdk-quiz.s3.us-east-1.amazonaws.com/leaderboard_1.png",
  },
  correctAnswerParticle: "brain_float",
  completionParticle: "partyPopper_float",
  replayMode: "manual" as "manual" | "never",
  showCorrectAnswer: true,
  timerEnabled: true,
  timerDurationMinutes: undefined as number | undefined,
};

// One question of each type: 1 = multiple choice, 2 = all that apply, 3 = open text.
export const SAMPLE_QUESTIONS: Record<string, Question> = {
  "1": {
    questionText: "What is the capital of France?",
    questionType: "multipleChoice",
    options: { "1": "Berlin", "2": "Paris", "3": "Madrid" },
    answer: "2",
  },
  "2": {
    questionText: "Which of these are primary colors?",
    questionType: "allThatApply",
    options: { "1": "Red", "2": "Green", "3": "Blue", "4": "Yellow" },
    answer: "",
    correctOptions: ["1", "3", "4"],
  },
  "3": {
    questionText: "What gas do plants absorb?",
    questionType: "openText",
    options: {},
    answer: "Carbon Dioxide",
  },
};

export type SeedOptions = {
  isAdmin?: boolean;
  /** Visitor is standing inside the start/question zones. */
  inZone?: boolean;
  /** Omit for a freshly dropped, never-configured quiz. */
  questions?: Record<string, Question>;
  settings?: Partial<typeof DEFAULT_SETTINGS>;
  /** profileId -> "displayName|score|mm:ss[|date|answered|attempts]" */
  leaderboard?: Record<string, string>;
  playerStatus?: PlayerStatus;
  /** Extra visitor data-object fields, e.g. totalQuizzesCompleted or quizCompletions. */
  visitorData?: Record<string, unknown>;
  /** Badges the visitor already owns. */
  badges?: string[];
};

export type IframePage = "start" | "question" | "leaderboard";

export class QuizWorld {
  readonly quizKey: string;
  readonly displayName = "E2E Player";

  constructor(
    readonly urlSlug: string,
    readonly profileId: string,
    private request: APIRequestContext,
  ) {
    this.quizKey = `${urlSlug}-${SCENE_DROP_ID}`;
  }

  async seed({
    isAdmin = false,
    inZone = true,
    questions,
    settings,
    leaderboard = {},
    playerStatus,
    visitorData = {},
    badges = [],
  }: SeedOptions = {}) {
    const isConfigured = !!questions;
    const questionIds = Object.keys(questions || {});
    const assets: Record<string, any> = {
      [KEY_ASSET_ID]: {
        id: KEY_ASSET_ID,
        position: { x: 500, y: 500 },
        uniqueName: "start",
        sceneDropId: SCENE_DROP_ID,
        dataObject: isConfigured
          ? {
              questions,
              settings: { ...DEFAULT_SETTINGS, ...settings },
              droppedAssets: {
                ...Object.fromEntries(questionIds.map((id) => [id, questionAssetId(id)])),
                leaderboard: LEADERBOARD_ASSET_ID,
              },
              leaderboard,
            }
          : {},
      },
    };
    if (isConfigured) {
      questionIds.forEach((id, i) => {
        assets[questionAssetId(id)] = {
          id: questionAssetId(id),
          position: { x: 650 + i * 150, y: 500 },
          uniqueName: `Quiz_question_${id}`,
          sceneDropId: SCENE_DROP_ID,
          dataObject: {},
        };
      });
      assets[LEADERBOARD_ASSET_ID] = {
        id: LEADERBOARD_ASSET_ID,
        position: { x: 300, y: 500 },
        uniqueName: "Quiz_leaderboard",
        sceneDropId: SCENE_DROP_ID,
        dataObject: {},
      };
    }

    const response = await this.request.post(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`, {
      data: {
        dataObject: isConfigured ? { [SCENE_DROP_ID]: { keyAssetId: KEY_ASSET_ID } } : {},
        assets,
        visitors: {
          [VISITOR_ID]: {
            isAdmin,
            profileId: this.profileId,
            displayName: this.displayName,
            landmarkZonesString: inZone ? Object.keys(assets).join(",") : "",
            privateZoneId: "",
            dataObject: { ...visitorData, ...(playerStatus && { [this.quizKey]: playerStatus }) },
            inventory: badges.map((name) => ({
              id: `owned-${name}`,
              item_id: `owned-${name}`,
              status: "ACTIVE",
              item: { name, type: "BADGE", image_url: "" },
            })),
          },
        },
      },
    });
    if (!response.ok()) throw new Error(`Seeding mock world failed: ${response.status()}`);
  }

  async state() {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`);
    return (await response.json()) as {
      dataObject: Record<string, any>;
      assets: Record<string, any>;
      visitors: Record<string, any>;
      events: Array<Record<string, any>>;
      unhandled: string[];
    };
  }

  /** Badge names granted during the test. */
  async grantedBadges() {
    return (await this.state()).events.filter((e) => e.type === "grant-item").map((e) => e.name as string).sort();
  }

  async keyAssetData() {
    return (await this.state()).assets[KEY_ASSET_ID].dataObject;
  }

  async playerStatus(): Promise<PlayerStatus | undefined> {
    return (await this.state()).visitors[VISITOR_ID].dataObject[this.quizKey];
  }

  async userData(profileId: string) {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/users/${profileId}`);
    return (await response.json()).dataObject;
  }

  /** Iframe URL with the session credentials Topia appends when it opens the app. */
  url(page: IframePage, questionId?: string) {
    const assetId = page === "start" ? KEY_ASSET_ID : page === "leaderboard" ? LEADERBOARD_ASSET_ID : questionAssetId(questionId!);
    const params = new URLSearchParams({
      assetId,
      displayName: this.displayName,
      identityId: "identity-1",
      interactiveNonce: "e2e-nonce",
      interactivePublicKey: INTERACTIVE_KEY,
      profileId: this.profileId,
      sceneDropId: SCENE_DROP_ID,
      uniqueName: page === "start" ? "start" : "",
      urlSlug: this.urlSlug,
      username: "e2e-player",
      visitorId: String(VISITOR_ID),
    });
    if (questionId) params.set("questionId", questionId);
    return `/${page}?${params}`;
  }

  /** App API path carrying the credentials of the given iframe page, as the client sends them. */
  api(path: string, page: IframePage = "start", questionId?: string) {
    return `/api${path}${new URL(this.url(page, questionId), "http://x").search}`;
  }
}

export const openAdminSettings = async (page: Page) => {
  // The admin cog has no accessible name; it's the only rounded icon button on the start page.
  await page.locator("button.icon-with-rounded-border").click();
};

export const test = base.extend<{ world: QuizWorld }>({
  world: async ({ request }, use, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`.replace(/[^a-zA-Z0-9-]/g, "");
    const world = new QuizWorld(`quiz-${id}`, `profile-${id}`, request);
    await use(world);

    // Fail the test if the app called a public-API endpoint the mock doesn't implement (e.g. after an
    // @rtsdk/topia upgrade): it would otherwise pass against a 501 the real API never returns.
    expect((await world.state()).unhandled, "public-API calls mock-topia doesn't implement").toEqual([]);
    const outside = await (await request.get(`${MOCK_TOPIA_URL}/__mock/unhandled`)).json();
    expect(outside, "public-API calls mock-topia doesn't implement").toEqual([]);
  },
});

export { expect } from "@playwright/test";
