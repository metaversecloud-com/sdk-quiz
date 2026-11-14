import { Page } from "@playwright/test";
import { PlayerStatus, QuizWorld, SAMPLE_QUESTIONS, expect, test } from "../fixtures";

const OLD_DATE = "2026-11-01T00:00:00.000Z";

// Player with questions 1 and 2 already answered; answering question 3 finishes the quiz.
const almostDone = ({ q1Correct = true, secondsAgo = 5 } = {}): PlayerStatus => ({
  answers: {
    "1": { answer: q1Correct ? "2" : "1", isCorrect: q1Correct },
    "2": { answer: "", selectedOptions: ["1", "3", "4"], isCorrect: true },
  },
  startTime: new Date(Date.now() - secondsAgo * 1000).toISOString(),
  endTime: null,
  timeElapsed: "",
});

const finishQuiz = async (page: Page, world: QuizWorld) => {
  const response = await page.request.post(world.api("/question/answer/3", "question", "3"), {
    data: { isCorrect: true, selectedOption: "carbon dioxide" },
  });
  expect(response.ok()).toBe(true);
};

const timeOut = async (page: Page, world: QuizWorld) => {
  const response = await page.request.post(world.api("/quiz/timeout"));
  expect(response.ok()).toBe(true);
};

const visitorData = async (world: QuizWorld) => (await world.state()).visitors["42"].dataObject;

test.describe("replays keep the best result", () => {
  test("a lower score keeps the earlier entry but counts the attempt", async ({ page, world }) => {
    const best = `E2E Player|3|00:30|${OLD_DATE}|3|1`;
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      leaderboard: { [world.profileId]: best },
      visitorData: { quizCompletions: { [world.quizKey]: 1 } },
      playerStatus: almostDone({ q1Correct: false }),
    });

    await finishQuiz(page, world);

    expect((await world.keyAssetData()).leaderboard[world.profileId]).toBe(best);
    expect((await visitorData(world)).quizCompletions[world.quizKey]).toBe(2);
  });

  test("the same score in a slower time keeps the earlier entry", async ({ page, world }) => {
    const best = `E2E Player|3|00:01|${OLD_DATE}|3|1`;
    await world.seed({ questions: SAMPLE_QUESTIONS, leaderboard: { [world.profileId]: best }, playerStatus: almostDone() });

    await finishQuiz(page, world);

    expect((await world.keyAssetData()).leaderboard[world.profileId]).toBe(best);
  });

  test("the same score in a faster time replaces the entry", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      leaderboard: { [world.profileId]: `E2E Player|3|02:00|${OLD_DATE}|3|1` },
      visitorData: { quizCompletions: { [world.quizKey]: 1 } },
      playerStatus: almostDone(),
    });

    await finishQuiz(page, world);

    expect((await world.keyAssetData()).leaderboard[world.profileId]).toMatch(/^E2E Player\|3\|00:0\d\|.+\|3\|2$/);
  });
});

test.describe("timeouts (EXP-428)", () => {
  const timedOut = (): PlayerStatus => ({
    answers: {},
    startTime: new Date(Date.now() - 90_000).toISOString(),
    endTime: null,
    timeElapsed: "",
  });

  test("a timed-out replay keeps a better earlier entry", async ({ page, world }) => {
    test.fail(true, "EXP-428: handleTimeoutQuiz overwrites the leaderboard entry unconditionally");
    const best = `E2E Player|3|00:30|${OLD_DATE}|3|1`;
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      settings: { timerDurationMinutes: 1 },
      leaderboard: { [world.profileId]: best },
      playerStatus: timedOut(),
    });

    await timeOut(page, world);

    expect((await world.keyAssetData()).leaderboard[world.profileId]).toBe(best);
  });

  test("a timed-out entry records attempts as a number", async ({ page, world }) => {
    test.fail(true, "EXP-428: handleTimeoutQuiz writes 'Y' in the attempts field");
    await world.seed({ questions: SAMPLE_QUESTIONS, settings: { timerDurationMinutes: 1 }, playerStatus: timedOut() });

    await timeOut(page, world);
    const { leaderboard } = await (await page.request.get(world.api("/quiz"))).json();

    expect(leaderboard[0].attempts).toBe(1);
  });

  test("a timed-out quiz counts toward total completions", async ({ page, world }) => {
    test.fail(true, "EXP-428: timeouts increment quizzesCompleted instead of totalQuizzesCompleted");
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      settings: { timerDurationMinutes: 1 },
      visitorData: { totalQuizzesCompleted: 3 },
      playerStatus: timedOut(),
    });

    await timeOut(page, world);

    expect((await visitorData(world)).totalQuizzesCompleted).toBe(4);
  });
});

test.describe("badges", () => {
  test("Quiz Master on the 10th completed quiz", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      visitorData: { totalQuizzesCompleted: 9 },
      playerStatus: almostDone({ q1Correct: false, secondsAgo: 120 }),
    });

    await finishQuiz(page, world);

    expect(await world.grantedBadges()).toEqual(["Quiz Master", "Top 3 Finisher"]);
    expect((await visitorData(world)).totalQuizzesCompleted).toBe(10);
  });

  test("a badge the player already owns isn't granted again", async ({ page, world }) => {
    await world.seed({ questions: SAMPLE_QUESTIONS, badges: ["Perfect Score"], playerStatus: almostDone() });

    await finishQuiz(page, world);

    expect(await world.grantedBadges()).toEqual(["Lightning Round", "Top 3 Finisher"]);
  });

  test("no Top 3 badge for fourth place", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      leaderboard: { "profile-a": "Ana|3|00:10", "profile-b": "Ben|3|00:20", "profile-c": "Cy|3|00:30" },
      playerStatus: almostDone({ q1Correct: false, secondsAgo: 120 }),
    });

    await finishQuiz(page, world);

    expect(await world.grantedBadges()).toEqual([]);
  });
});

test("after an admin reset, a returning finisher starts fresh", async ({ page, world }) => {
  await world.seed({
    questions: SAMPLE_QUESTIONS,
    leaderboard: {},
    playerStatus: {
      answers: { "1": { answer: "2", isCorrect: true } },
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: new Date().toISOString(),
      timeElapsed: "01:00",
    },
  });
  await page.goto(world.url("start"));

  await expect(page.getByRole("button", { name: "Start the quiz" })).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Hooray, quiz complete!" })).toHaveCount(0);
  expect(await world.playerStatus()).toEqual({ answers: {}, timeElapsed: "", endTime: null, startTime: null });
});

test("particles set to None fire nothing", async ({ page, world }) => {
  await world.seed({
    questions: SAMPLE_QUESTIONS,
    settings: { correctAnswerParticle: "", completionParticle: "" },
    playerStatus: almostDone(),
  });

  await finishQuiz(page, world);

  expect((await world.state()).events.filter((e) => e.type === "particles")).toEqual([]);
});
