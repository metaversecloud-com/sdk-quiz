import { SAMPLE_QUESTIONS, expect, test } from "../fixtures";

const LEADERBOARD = {
  "profile-slow": "Slow Sam|3|02:10",
  "profile-fast": "Fast Fran|3|00:45",
  "profile-low": "Low Lou|1|00:20",
};

test("empty leaderboard", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS });
  await page.goto(world.url("leaderboard"));

  await expect(page.getByText("There are no race finishes yet.")).toBeVisible();
});

test("ranks by score, then by time", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS, leaderboard: LEADERBOARD });
  await page.goto(world.url("leaderboard"));

  const rows = page.getByRole("table", { name: "Leaderboard" }).locator("tbody tr");
  await expect(rows).toHaveText([/1\s*Fast Fran\s*3\/3\s*00:45/, /2\s*Slow Sam\s*3\/3\s*02:10/, /3\s*Low Lou\s*1\/3\s*00:20/]);
  await expect(page.getByRole("button", { name: "Reset quiz" })).toHaveCount(0);
});

test("admin resets the leaderboard and every player's progress", async ({ page, world }) => {
  await world.seed({ isAdmin: true, questions: SAMPLE_QUESTIONS, leaderboard: LEADERBOARD });
  await page.goto(world.url("leaderboard"));

  await page.getByRole("button", { name: "Reset quiz" }).click();
  await expect(page.getByRole("heading", { name: "Reset Quiz?" })).toBeVisible();
  await page.getByRole("button", { name: "Yes" }).click();

  await expect(page.getByText("There are no race finishes yet.")).toBeVisible();
  expect((await world.keyAssetData()).leaderboard).toEqual({});
  for (const profileId of Object.keys(LEADERBOARD)) {
    expect((await world.userData(profileId))[world.quizKey]).toEqual({
      answers: {},
      timeElapsed: "",
      endTime: null,
      startTime: null,
    });
  }
});

test("badges tab lists ecosystem badges", async ({ page, world }) => {
  await world.seed({ questions: SAMPLE_QUESTIONS });
  await page.goto(world.url("leaderboard"));

  await page.getByRole("button", { name: "Badges tab" }).click();
  for (const name of ["Perfect Score", "Lightning Round", "Quiz Master", "Top 3 Finisher"]) {
    await expect(page.getByRole("img", { name, exact: true })).toBeVisible();
  }
});
