import { KEY_ASSET_ID, SAMPLE_QUESTIONS, expect, openAdminSettings, questionAssetId, test } from "../fixtures";

test.describe("unconfigured quiz", () => {
  test("players see the not-live message and no admin controls", async ({ page, world }) => {
    await world.seed({ isAdmin: false });
    await page.goto(world.url("start"));

    await expect(page.getByRole("heading", { name: "This Quiz Isn't Live Yet" })).toBeVisible();
    await expect(page.locator("button.icon-with-rounded-border")).toHaveCount(0);
  });

  test("admin must save settings before adding questions", async ({ page, world }) => {
    await world.seed({ isAdmin: true });
    await page.goto(world.url("start"));
    await openAdminSettings(page);

    await page.getByRole("button", { name: "Questions section" }).click();
    await expect(page.getByText("You must save settings before adding questions.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Questions" })).toBeDisabled();
  });

  test("admin configures a new quiz end to end", async ({ page, world }) => {
    await world.seed({ isAdmin: true });
    await page.goto(world.url("start"));
    await openAdminSettings(page);

    // Settings
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByRole("button", { name: "Save Settings" })).toBeEnabled();
    await expect.poll(async () => (await world.keyAssetData()).settings).toBeTruthy();

    let state = await world.state();
    const leaderboardAssetId = state.assets[KEY_ASSET_ID].dataObject.droppedAssets.leaderboard;
    expect(state.assets[leaderboardAssetId]).toMatchObject({ uniqueName: "Quiz_leaderboard" });

    // First question (multiple choice)
    await page.getByRole("button", { name: "Questions section" }).click();
    await page.getByRole("button", { name: "Add new question" }).click();
    const q1 = page.getByRole("region", { name: "Question 1" });
    await q1.getByLabel("Question 1 text").fill("What is 2 + 2?");
    await q1.getByLabel("Option 1 text").fill("3");
    await q1.getByLabel("Option 2 text").fill("4");
    await q1.getByLabel("Mark option 2 as correct").check();
    await page.getByRole("button", { name: "Save Questions" }).click();
    await expect(page.getByRole("button", { name: "Save Questions" })).toHaveText("Save Questions");

    state = await world.state();
    const { questions, droppedAssets } = state.assets[KEY_ASSET_ID].dataObject;
    expect(questions["1"]).toMatchObject({
      questionText: "What is 2 + 2?",
      questionType: "multipleChoice",
      options: { "1": "3", "2": "4" },
      answer: "2",
    });
    expect(state.assets[droppedAssets["1"]]).toMatchObject({ uniqueName: "Quiz_question_1", isWebhookZoneEnabled: true });
    expect(state.events).toContainEqual(
      expect.objectContaining({
        type: "webhooks",
        webhookType: "webhookZoneEntered",
        assetId: droppedAssets["1"],
        url: expect.stringMatching(/\/api\/iframe\/1$/),
      }),
    );

    // Players now see the live quiz
    await page.reload();
    await expect(page.getByRole("heading", { name: "Welcome to Quiz Race!" })).toBeVisible();
  });
});

test.describe("question editor", () => {
  test("shows validation errors and saves nothing for incomplete questions", async ({ page, world }) => {
    await world.seed({ isAdmin: true, questions: { "1": SAMPLE_QUESTIONS["1"] } });
    await page.goto(world.url("start"));
    await openAdminSettings(page);
    await page.getByRole("button", { name: "Questions section" }).click();

    await page.getByRole("button", { name: "Add new question" }).click();
    await page.getByRole("button", { name: "Save Questions" }).click();

    const q2 = page.getByRole("region", { name: "Question 2" });
    await expect(q2.getByText("Question text is required.")).toBeVisible();
    await expect(q2.getByText("Option cannot be empty.")).toHaveCount(2);
    await expect(q2.getByText("Select the correct answer.")).toBeVisible();

    // Open text and all-that-apply have their own required fields
    await q2.getByLabel("Question 2 text").fill("Name a planet");
    await q2.getByLabel("Open Text").check();
    await page.getByRole("button", { name: "Save Questions" }).click();
    await expect(q2.getByText("Correct answer is required.")).toBeVisible();

    await q2.getByLabel("All That Apply").check();
    await q2.getByLabel("Option 1 text").fill("Mars");
    await q2.getByLabel("Option 2 text").fill("Moon");
    await page.getByRole("button", { name: "Save Questions" }).click();
    await expect(q2.getByText("Select at least one correct answer.")).toBeVisible();

    expect(Object.keys((await world.keyAssetData()).questions)).toEqual(["1"]);
  });

  test("adds one question of each type in a single save", async ({ page, world }) => {
    await world.seed({ isAdmin: true, questions: { "1": SAMPLE_QUESTIONS["1"] } });
    await page.goto(world.url("start"));
    await openAdminSettings(page);
    await page.getByRole("button", { name: "Questions section" }).click();

    // Question 2: all that apply, with a third option
    await page.getByRole("button", { name: "Add new question" }).click();
    const q2 = page.getByRole("region", { name: "Question 2" });
    await q2.getByLabel("All That Apply").check();
    await q2.getByLabel("Question 2 text").fill("Which are even?");
    await q2.getByLabel("Option 1 text").fill("2");
    await q2.getByLabel("Option 2 text").fill("3");
    await q2.getByRole("button", { name: "Add another option" }).click();
    await q2.getByLabel("Option 3 text").fill("4");
    await q2.getByLabel("Mark option 1 as correct").check();
    await q2.getByLabel("Mark option 3 as correct").check();

    // Question 3: open text with media
    await page.getByRole("button", { name: "Add new question" }).click();
    const q3 = page.getByRole("region", { name: "Question 3" });
    await q3.getByLabel("Open Text").check();
    await q3.getByLabel("Question 3 text").fill("Largest ocean?");
    await q3.getByLabel("Correct answer text").fill("Pacific");
    await q3.getByLabel("Media URL attachment").fill("https://example.com/ocean.png");

    await expect(page.getByRole("button", { name: "Questions section" })).toHaveText("Questions (3)");
    await page.getByRole("button", { name: "Save Questions" }).click();

    await expect.poll(async () => Object.keys((await world.keyAssetData()).questions)).toEqual(["1", "2", "3"]);
    const { questions, droppedAssets } = await world.keyAssetData();
    expect(questions["2"]).toMatchObject({
      questionType: "allThatApply",
      options: { "1": "2", "2": "3", "3": "4" },
      correctOptions: ["1", "3"],
    });
    expect(questions["3"]).toMatchObject({
      questionType: "openText",
      answer: "Pacific",
      mediaUrl: "https://example.com/ocean.png",
    });
    // Existing question keeps its asset; new ones get freshly dropped assets
    expect(droppedAssets["1"]).toBe(questionAssetId("1"));
    expect(droppedAssets["2"]).not.toBe(droppedAssets["3"]);
  });

  test("edits an existing question without dropping a new asset", async ({ page, world }) => {
    await world.seed({ isAdmin: true, questions: { "1": SAMPLE_QUESTIONS["1"], "2": SAMPLE_QUESTIONS["3"] } });
    const assetsBefore = Object.keys((await world.state()).assets);

    await page.goto(world.url("start"));
    await openAdminSettings(page);
    await page.getByRole("button", { name: "Questions section" }).click();

    const q1 = page.getByRole("region", { name: "Question 1" });
    await expect(q1.getByLabel("Question 1 text")).toHaveValue("What is the capital of France?");
    await q1.getByLabel("Question 1 text").fill("What is the capital of Spain?");
    await q1.getByLabel("Mark option 3 as correct").check();
    await q1.getByRole("button", { name: "Remove option 1" }).click();

    const q2 = page.getByRole("region", { name: "Question 2" });
    await q2.getByLabel("Correct answer text").fill("CO2");

    await page.getByRole("button", { name: "Save Questions" }).click();

    await expect.poll(async () => (await world.keyAssetData()).questions["1"].questionText).toBe(
      "What is the capital of Spain?",
    );
    const { questions } = await world.keyAssetData();
    expect(questions["1"]).toMatchObject({ answer: "3", options: { "2": "Paris", "3": "Madrid" } });
    expect(questions["1"].options).not.toHaveProperty("1");
    expect(questions["2"].answer).toBe("CO2");
    expect(Object.keys((await world.state()).assets)).toEqual(assetsBefore);
  });

  test("deletes a saved question, removes its asset and renumbers the rest", async ({ page, world }) => {
    await world.seed({ isAdmin: true, questions: SAMPLE_QUESTIONS });
    await page.goto(world.url("start"));
    await openAdminSettings(page);
    await page.getByRole("button", { name: "Questions section" }).click();

    await page.getByRole("button", { name: "Delete question 2" }).click();

    await expect(page.getByRole("button", { name: "Questions section" })).toHaveText("Questions (2)");
    await expect(page.getByRole("region", { name: "Question 2" }).getByLabel("Question 2 text")).toHaveValue(
      SAMPLE_QUESTIONS["3"].questionText,
    );

    const state = await world.state();
    const { questions, droppedAssets } = state.assets[KEY_ASSET_ID].dataObject;
    expect(state.assets[questionAssetId("2")]).toBeUndefined();
    expect(state.events).toContainEqual({ type: "delete-asset", assetId: questionAssetId("2") });
    expect(questions["2"].questionText).toBe(SAMPLE_QUESTIONS["3"].questionText);
    expect(droppedAssets).toMatchObject({ "1": questionAssetId("1"), "2": questionAssetId("3") });
  });

  test("the last remaining question cannot be deleted", async ({ page, world }) => {
    await world.seed({ isAdmin: true, questions: { "1": SAMPLE_QUESTIONS["1"] } });
    await page.goto(world.url("start"));
    await openAdminSettings(page);
    await page.getByRole("button", { name: "Questions section" }).click();

    await expect(page.getByRole("region", { name: "Question 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete question 1" })).toHaveCount(0);
  });
});

test("admin saves quiz settings", async ({ page, world }) => {
  await world.seed({ isAdmin: true, questions: SAMPLE_QUESTIONS });
  await page.goto(world.url("start"));
  await openAdminSettings(page);

  await page.getByLabel("Allow replay").uncheck();
  await page.getByLabel("Show correct answer").uncheck();
  await page.getByLabel("Timer duration in minutes").fill("5");
  await page.getByRole("button", { name: "Save Settings" }).click();

  await expect.poll(async () => (await world.keyAssetData()).settings.replayMode).toBe("never");
  expect((await world.keyAssetData()).settings).toMatchObject({
    showCorrectAnswer: false,
    timerEnabled: true,
    timerDurationMinutes: 5,
  });
});
