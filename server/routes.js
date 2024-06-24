import express from "express";
import {
  getDroppedAssets,
  getVisitor,
  updateTimestamp,
  getTimestamp,
  registerUserAnswer,
  clear,
  leaderboard,
  getQuestionsStatistics,
  resetTimer,
  resetGame,
  getStartDroppedAsset,
  updateStartTimestamp,
  getStartAssetFromQuestionAsset,
  getAllQuestionAssets,
  updateQuestion,
  getLeaderboardFromStartAsset,
  openStartIframe,
  reloadIframe,
  getLeaderboardFromQuestionAsset,
} from "./utils/index.js";

import { validationMiddleware } from "./middlware/validation.js";

const SERVER_START_DATE = new Date();

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/api/system/health", (req, res) => {
  return res.json({
    NODE_ENV: process.env.NODE_ENV,
    DEPLOYMENT_DATE: SERVER_START_DATE,
    COMMIT_HASH: process.env.COMMIT_HASH ? process.env.COMMIT_HASH : "NOT SET",
    SHOWCASE_WORLDS_URLS: ["https://topia.io/quiz-prod"],
    INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN
      ? process.env.INSTANCE_DOMAIN
      : "NOT SET",
    INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL
      ? process.env.INSTANCE_PROTOCOL
      : "NOT SET",
    INTERACTIVE_KEY: process.env.INTERACTIVE_KEY
      ? process.env.INTERACTIVE_KEY
      : "NOT SET",
    IMG_ASSET_ID: process.env.IMG_ASSET_ID
      ? process.env.IMG_ASSET_ID
      : "NOT SET",
    GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL
      ? "SET"
      : "NOT SET",
    GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID
      ? "SET"
      : "NOT SET",
    GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY
      ? "SET"
      : "NOT SET",
  });
});

// Endpoints for Start Asset
router.get("/start-dropped-asset", validationMiddleware, getStartDroppedAsset);
router.get("/all-question-assets", validationMiddleware, getAllQuestionAssets);
router.put("/start-timestamp", validationMiddleware, updateStartTimestamp);
router.post("/registerUserAnswer", validationMiddleware, registerUserAnswer);
router.post("/resetGame", validationMiddleware, resetGame);
router.put("/timestamp", validationMiddleware, updateTimestamp);
router.get(
  "/leaderboard-from-start-asset",
  validationMiddleware,
  getLeaderboardFromStartAsset
);

// Webhooks
router.post("/start/open-iframe", openStartIframe);
router.post("/reload-iframe", reloadIframe);

// Endpoints for Question Asset
router.get(
  "/question/start-dropped-asset",
  validationMiddleware,
  getStartAssetFromQuestionAsset
);

router.get(
  "/leaderboard-from-question-asset",
  validationMiddleware,
  getLeaderboardFromQuestionAsset
);

// Leaderboard Endpoints
router.get("/leaderboard", validationMiddleware, leaderboard);

// Endpoints that can be called from any asset
router.get("/visitor", validationMiddleware, getVisitor);
router.put("/question", validationMiddleware, updateQuestion);

// Deprecated endpoints
router.get("/dropped-asset", validationMiddleware, getDroppedAssets);
router.get("/timestamp", validationMiddleware, getTimestamp);
router.get(
  "/questionsStatistics",
  validationMiddleware,
  getQuestionsStatistics
);
router.post("/clear", validationMiddleware, clear);
router.post("/resetTimer", validationMiddleware, resetTimer);

export default router;
