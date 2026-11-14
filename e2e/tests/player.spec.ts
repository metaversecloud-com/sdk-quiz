import { PlayerStatus, SAMPLE_QUESTIONS, VISITOR_ID, expect, test } from "../fixtures";

const startedStatus = (secondsAgo = 5, answers: PlayerStatus["answers"] = {}): PlayerStatus => ({
  answers,
  startTime: new Date(Date.now() - secondsAgo * 1000).toISOString(),
  endTime: null,
  timeElapsed: "",
});

test.describe("start page", () => {
  test("starting the quiz records the start time and teleports the player", async ({ page, world }) => {
    await world.seed({ questions: SAMPLE_QUESTIONS });
    await page.goto(world.url("start"));

    await expect(page.getByRole("heading", { name: "Welcome to Quiz Race!" })).toBeVisible();
    await page.getByRole("button", { name: "Start the quiz" }).click();

    await expect(page.getByRole("heading", { name: "Quiz in progress!" })).toBeVisible();
    await expect(page.getByText("Questions completed: 0 / 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start the quiz" })).toBeDisabled();

    expect((await world.playerStatus())?.startTime).toBeTruthy();
    await expect
      .poll(async () => (await world.state()).events.find((e) => e.type === "move"))
      .toMatchObject({ moveTo: { x: 500, y: 500 }, teleport: true });
  });

  test("timed quiz auto-completes with unanswered questions marked wrong", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      settings: { timerDurationMinutes: 1 },
      playerStatus: startedStatus(90, { "1": { answer: "2", isCorrect: true } }),
    });
    await page.goto(world.url("start"));

    await expect(page.getByRole("heading", { name: "Hooray, quiz complete!" })).toBeVisible();
    await expect(page.getByText("1 / 3 correct in 01:00")).toBeVisible();

    const status = await world.playerStatus();
    expect(status?.answers["2"]).toEqual({ answer: "", isCorrect: false });
    expect(status?.answers["3"]).toEqual({ answer: "", isCorrect: false });
    expect((await world.keyAssetData()).leaderboard[world.profileId]).toMatch(/^E2E Player\|1\|01:00\|/);
  });
});

test.describe("question page guards", () => {
  test("asks the player to start the race first", async ({ page, world }) => {
    await world.seed({ questions: SAMPLE_QUESTIONS });
    await page.goto(world.url("question", "1"));

    await expect(page.getByRole("heading", { name: "Quiz race not started" })).toBeVisible();
  });

  test("blocks answering from outside the question zone", async ({ page, world }) => {
    await world.seed({ questions: SAMPLE_QUESTIONS, inZone: false, playerStatus: startedStatus() });
    await page.goto(world.url("question", "1"));

    await expect(page.getByRole("heading", { name: "Outside zone" })).toBeVisible();
  });
});

test.describe("answering", () => {
  test.beforeEach(async ({ world }) => {
    await world.seed({ questions: SAMPLE_QUESTIONS, playerStatus: startedStatus() });
  });

  test("multiple choice: right answer", async ({ page, world }) => {
    await page.goto(world.url("question", "1"));
    await page.getByLabel("Option: Paris").check();
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("You're a genius!");
    await expect(page.getByText("Questions completed: 1 / 3")).toBeVisible();
    expect((await world.playerStatus())?.answers["1"]).toEqual({ answer: "2", isCorrect: true });
    // correctAnswerParticle fires at the question asset
    await expect
      .poll(async () => (await world.state()).events.filter((e) => e.type === "particles"))
      .toContainEqual(expect.objectContaining({ particleId: "particle-1" }));
  });

  test("multiple choice: wrong answer reveals the correct one", async ({ page, world }) => {
    await page.goto(world.url("question", "1"));
    await page.getByLabel("Option: Berlin").check();
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("Nice try! Mistakes help us learn and grow!");
    await expect(page.locator("p.text-success")).toHaveText("Paris");
    expect((await world.playerStatus())?.answers["1"]).toEqual({ answer: "1", isCorrect: false });
  });

  test("all that apply: every correct option selected", async ({ page, world }) => {
    await page.goto(world.url("question", "2"));
    for (const color of ["Red", "Blue", "Yellow"]) await page.getByLabel(`Option: ${color}`).check();
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("You got them all right!");
    expect((await world.playerStatus())?.answers["2"]).toMatchObject({ selectedOptions: ["1", "3", "4"], isCorrect: true });
  });

  test("all that apply: partial selection is wrong and highlights the answers", async ({ page, world }) => {
    await page.goto(world.url("question", "2"));
    await page.getByLabel("Option: Red").check();
    await page.getByLabel("Option: Green").check();
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("Not quite! Check the highlighted answers above.");
    // Wrong picks are red; every correct option (picked or missed) is green.
    await expect(page.getByText("Green", { exact: true })).toHaveClass(/text-danger/);
    for (const color of ["Red", "Blue", "Yellow"]) {
      await expect(page.getByText(color, { exact: true })).toHaveClass(/text-success/);
    }
    expect((await world.playerStatus())?.answers["2"].isCorrect).toBe(false);
  });

  test("open text: matching is case- and whitespace-insensitive", async ({ page, world }) => {
    await page.goto(world.url("question", "3"));
    await page.getByLabel("Your answer").fill("  carbon DIOXIDE ");
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("Correct!");
    expect((await world.playerStatus())?.answers["3"].isCorrect).toBe(true);
  });

  test("open text: wrong answer reveals the correct one", async ({ page, world }) => {
    await page.goto(world.url("question", "3"));
    await page.getByLabel("Your answer").fill("Oxygen");
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("status")).toHaveText("Not quite!");
    await expect(page.locator("p.text-success")).toHaveText("Carbon Dioxide");
    expect((await world.playerStatus())?.answers["3"]).toMatchObject({ answer: "Oxygen", isCorrect: false });
  });

  test("an answered question is locked on revisit", async ({ page, world }) => {
    await page.goto(world.url("question", "1"));
    await page.getByLabel("Option: Paris").check();
    await page.getByRole("button", { name: "Submit answer" }).click();
    await expect(page.getByRole("status")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Option: Paris")).toBeChecked();
    await expect(page.getByLabel("Option: Berlin")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Submit answer" })).toHaveCount(0);
  });
});

test.describe("server-side answer checks", () => {
  // The client sends its own isCorrect; open text and all-that-apply must be re-graded by the server.
  for (const [questionId, body] of [
    ["3", { isCorrect: true, selectedOption: "Oxygen" }],
    ["2", { isCorrect: true, selectedOptions: ["1"] }],
  ] as const) {
    test(`question ${questionId}: a forged isCorrect is rejected`, async ({ page, world }) => {
      await world.seed({ questions: SAMPLE_QUESTIONS, playerStatus: startedStatus() });
      const query = new URL(world.url("question", questionId), "http://x").search;

      const response = await page.request.post(`/api/question/answer/${questionId}${query}`, { data: body });
      expect(response.ok()).toBe(true);
      expect((await world.playerStatus())?.answers[questionId].isCorrect).toBe(false);
    });
  }
});

test("hidden answers: no reveal in the UI or the API response", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS, settings: { showCorrectAnswer: false }, playerStatus: startedStatus() });
  await page.goto(world.url("question", "1"));
  await page.getByLabel("Option: Berlin").check();

  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/question/answer/1"));
  await page.getByRole("button", { name: "Submit answer" }).click();
  const { quiz } = await (await responsePromise).json();

  await expect(page.getByRole("status")).toHaveText("Answer recorded! Move on to the next question.");
  await expect(page.getByText("The correct answer is:")).toHaveCount(0);
  for (const question of Object.values<any>(quiz.questions)) {
    expect(question).not.toHaveProperty("answer");
    expect(question).not.toHaveProperty("correctOptions");
  }
});

test.describe("completing the quiz", () => {
  test("perfect run: leaderboard entry, completion particle and badges", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      playerStatus: startedStatus(5, {
        "1": { answer: "2", isCorrect: true },
        "2": { answer: "", selectedOptions: ["1", "3", "4"], isCorrect: true },
      }),
    });
    await page.goto(world.url("question", "3"));
    await page.getByLabel("Your answer").fill("carbon dioxide");
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByRole("heading", { name: "Hooray, quiz complete!" })).toBeVisible();
    await expect(page.getByText(/^3 \/ 3 correct in 00:0\d$/)).toBeVisible();

    const status = await world.playerStatus();
    expect(status?.endTime).toBeTruthy();
    expect((await world.keyAssetData()).leaderboard[world.profileId]).toMatch(/^E2E Player\|3\|00:0\d\|.+\|3\|1$/);

    const events = (await world.state()).events;
    expect(events).toContainEqual(expect.objectContaining({ type: "particles", particleId: "particle-2", followPlayerId: VISITOR_ID }));
    const badges = events.filter((e) => e.type === "grant-item").map((e) => e.name);
    expect(badges.sort()).toEqual(["Lightning Round", "Perfect Score", "Top 3 Finisher"]);
  });

  test("slow run with a wrong answer earns no perfect/lightning badges", async ({ page, world }) => {
    await world.seed({
      questions: SAMPLE_QUESTIONS,
      playerStatus: startedStatus(120, {
        "1": { answer: "1", isCorrect: false },
        "2": { answer: "", selectedOptions: ["1", "3", "4"], isCorrect: true },
      }),
    });
    await page.goto(world.url("question", "3"));
    await page.getByLabel("Your answer").fill("carbon dioxide");
    await page.getByRole("button", { name: "Submit answer" }).click();

    await expect(page.getByText(/^2 \/ 3 correct in 02:0\d$/)).toBeVisible();
    await expect
      .poll(async () => (await world.state()).events.filter((e) => e.type === "grant-item").map((e) => e.name))
      .toEqual(["Top 3 Finisher"]);
  });

  test("replay allowed: restart clears progress", async ({ page, world }) => {
    const completed: PlayerStatus = {
      answers: { "1": { answer: "2", isCorrect: true } },
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: new Date().toISOString(),
      timeElapsed: "01:00",
    };
    await world.seed({
      questions: { "1": SAMPLE_QUESTIONS["1"] },
      leaderboard: { [world.profileId]: "E2E Player|1|01:00" },
      playerStatus: completed,
    });
    await page.goto(world.url("start"));

    await expect(page.getByRole("heading", { name: "Hooray, quiz complete!" })).toBeVisible();
    await page.getByRole("button", { name: "Race again" }).click();

    await expect(page.getByRole("heading", { name: "Quiz in progress!" })).toBeVisible();
    await expect(page.getByText("Questions completed: 0 / 1")).toBeVisible();
    expect((await world.playerStatus())?.answers).toEqual({});
  });

  test("replay disabled: no restart once finished", async ({ page, world }) => {
    await world.seed({
      questions: { "1": SAMPLE_QUESTIONS["1"] },
      settings: { replayMode: "never" },
      leaderboard: { [world.profileId]: "E2E Player|1|01:00" },
      playerStatus: {
        answers: { "1": { answer: "2", isCorrect: true } },
        startTime: new Date(Date.now() - 60_000).toISOString(),
        endTime: new Date().toISOString(),
        timeElapsed: "01:00",
      },
    });
    await page.goto(world.url("start"));

    await expect(page.getByRole("heading", { name: "Hooray, quiz complete!" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Race again" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Start the quiz" })).toHaveCount(0);
  });
});
