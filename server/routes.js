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
} from "./utils/index.js";

import { validationMiddleware } from "./middlware/validation.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Endpoints for Start Asset
router.get("/start-dropped-asset", validationMiddleware, getStartDroppedAsset);
router.put("/start-timestamp", validationMiddleware, updateStartTimestamp);
router.post("/registerUserAnswer", validationMiddleware, registerUserAnswer);
router.post("/resetGame", validationMiddleware, resetGame);
router.put("/timestamp", validationMiddleware, updateTimestamp);

// Endpoints for Question Asset
router.get(
  "/question/start-dropped-asset",
  validationMiddleware,
  getStartAssetFromQuestionAsset
);

// Deprecated endpoints
router.get("/dropped-asset", validationMiddleware, getDroppedAssets);
router.get("/visitor", validationMiddleware, getVisitor);
router.get("/leaderboard", validationMiddleware, leaderboard);
router.get("/timestamp", validationMiddleware, getTimestamp);

router.get(
  "/questionsStatistics",
  validationMiddleware,
  getQuestionsStatistics
);
router.post("/clear", validationMiddleware, clear);
router.post("/resetTimer", validationMiddleware, resetTimer);

export default router;
