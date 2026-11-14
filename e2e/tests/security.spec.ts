import { PlayerStatus, SAMPLE_QUESTIONS, expect, test } from "../fixtures";

const started = (secondsAgo = 5): PlayerStatus => ({
  answers: {},
  startTime: new Date(Date.now() - secondsAgo * 1000).toISOString(),
  endTime: null,
  timeElapsed: "",
});

test.describe("admin endpoints reject players", () => {
  const calls = [
    { name: "save questions", method: "put", path: "/admin/save-questions", data: { questions: { "1": SAMPLE_QUESTIONS["3"] } } },
    { name: "delete question", method: "delete", path: "/admin/delete-question/2" },
    { name: "update settings", method: "put", path: "/admin/update-settings", data: { settings: { replayMode: "never" } } },
    { name: "reset quiz", method: "post", path: "/admin/reset" },
    { name: "list particles", method: "get", path: "/admin/particles" },
  ] as const;

  for (const call of calls) {
    test(call.name, async ({ page, world }) => {
      await world.seed({ isAdmin: false, questions: SAMPLE_QUESTIONS, leaderboard: { "profile-other": "Other|3|00:30" } });
      const before = await world.keyAssetData();

      const response = await page.request[call.method](world.api(call.path), { data: "data" in call ? call.data : undefined });

      expect(response.ok()).toBe(false);
      expect((await response.json()).error).toBe("User is not an admin.");
      expect(await world.keyAssetData()).toEqual(before);
    });
  }
});

test("a request signed for another app's public key changes nothing", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS, playerStatus: started() });
  const path = world.api("/question/answer/1", "question", "1").replace("interactivePublicKey=e2e-public-key", "interactivePublicKey=someone-else");

  const response = await page.request.post(path, { data: { isCorrect: true, selectedOption: "2" } });

  expect(response.ok()).toBe(false);
  expect((await world.playerStatus())?.answers).toEqual({});
});

test("a timed quiz can't be ended early through the timeout endpoint", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS, settings: { timerDurationMinutes: 5 }, playerStatus: started(10) });

  const response = await page.request.post(world.api("/quiz/timeout"));

  expect(response.ok()).toBe(false);
  expect((await response.json()).error).toBe("Time has not expired yet.");
  expect((await world.playerStatus())?.endTime).toBeNull();
  expect((await world.keyAssetData()).leaderboard).toEqual({});
});

// Known bugs, tracked in EXP-428. test.fail() keeps the suite green while the bug exists and turns red
// once it's fixed, so the marker gets removed together with the fix.
test.describe("answer integrity (EXP-428)", () => {
  test("a forged isCorrect is rejected for multiple choice", async ({ page, world }) => {
    test.fail(true, "EXP-428: server trusts the client's isCorrect for multiple choice");
    await world.seed({ questions: SAMPLE_QUESTIONS, playerStatus: started() });

    await page.request.post(world.api("/question/answer/1", "question", "1"), { data: { isCorrect: true, selectedOption: "1" } });

    expect((await world.playerStatus())?.answers["1"].isCorrect).toBe(false);
  });

  test("a forged isCorrect is rejected for all-that-apply without selectedOptions", async ({ page, world }) => {
    test.fail(true, "EXP-428: all-that-apply is only re-graded when selectedOptions is sent");
    await world.seed({ questions: SAMPLE_QUESTIONS, playerStatus: started() });

    await page.request.post(world.api("/question/answer/2", "question", "2"), { data: { isCorrect: true } });

    expect((await world.playerStatus())?.answers["2"].isCorrect).toBe(false);
  });

  test("players don't receive the answer key", async ({ page, world }) => {
    test.fail(true, "EXP-428: GET /api/quiz returns answer and correctOptions to everyone");
    await world.seed({ questions: SAMPLE_QUESTIONS, settings: { showCorrectAnswer: false }, playerStatus: started() });

    const { quiz } = await (await page.request.get(world.api("/quiz", "question", "1"))).json();

    for (const question of Object.values<Record<string, unknown>>(quiz.questions)) {
      expect(question).not.toHaveProperty("answer");
      expect(question).not.toHaveProperty("correctOptions");
    }
  });
});
