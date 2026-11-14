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

// E2E_APP_IMAGE=<image> runs the app from a Docker image (e.g. to test a Node upgrade) instead of
// local Node. The container reaches the mock on the host through host.docker.internal.
const APP_IMAGE = process.env.E2E_APP_IMAGE;
const imageEnvFlags = Object.entries({
  ...appEnv,
  PORT: "3000",
  INSTANCE_DOMAIN: `host.docker.internal:${MOCK_TOPIA_PORT}`,
})
  .map(([key, value]) => `-e ${key}=${value}`)
  .join(" ");

const appServer = APP_IMAGE
  ? {
      command: `docker run --rm --init --name sdk-quiz-e2e --add-host=host.docker.internal:host-gateway -p ${APP_PORT}:3000 ${imageEnvFlags} ${APP_IMAGE}`,
      // Never reuse a server already on the port: it wouldn't be the image under test.
      reuseExistingServer: false,
    }
  : {
      command: "npm run build --prefix .. && node dist/server/index.js",
      cwd: "../server",
      env: appEnv,
      reuseExistingServer: !process.env.CI,
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
      ...appServer,
      url: `http://localhost:${APP_PORT}/api/system/health`,
      timeout: 180_000,
    },
  ],
});
