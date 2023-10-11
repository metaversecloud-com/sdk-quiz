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
} from "./utils/index.js";

import { validationMiddleware } from "./middlware/validation.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
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

// Endpoints for Question Asset
router.get(
  "/question/start-dropped-asset",
  validationMiddleware,
  getStartAssetFromQuestionAsset
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
