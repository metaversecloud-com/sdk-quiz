import { defineConfig, devices } from "@playwright/test";
import { APP_PORT, INTERACTIVE_KEY, MOCK_TOPIA_PORT } from "./constants";

// The real quiz server (production build) talks to an in-memory fake of the Topia public API.
// Explicit env wins over any developer ../.env because dotenv never overrides existing variables.
const appEnv = {
  PORT: String(APP_PORT),
  NODE_ENV: "test",
  INSTANCE_DOMAIN: `localhost:${MOCK_TOPIA_PORT}`,
  INSTANCE_PROTOCOL: "http",
  INTERACTIVE_KEY,
  INTERACTIVE_SECRET: "e2e-secret",
  API_KEY: "",
  WEB_IMAGE_ASSET_ID: "webImageAsset",
  GOOGLESHEETS_SHEET_ID: "",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node mock-topia/server.mjs",
      url: `http://localhost:${MOCK_TOPIA_PORT}/__mock/health`,
      env: { MOCK_TOPIA_PORT: String(MOCK_TOPIA_PORT), INTERACTIVE_KEY },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run build --prefix .. && node dist/server/index.js",
      cwd: "../server",
      url: `http://localhost:${APP_PORT}/api/system/health`,
      env: appEnv,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
