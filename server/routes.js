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

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Endpoints for Start Asset
router.get("/start-dropped-asset", getStartDroppedAsset);
router.put("/start-timestamp", updateStartTimestamp);

// Endpoints for Question Asset
router.get("/question/start-dropped-asset", getStartAssetFromQuestionAsset);

router.get("/dropped-asset", getDroppedAssets);
router.get("/visitor", getVisitor);
router.get("/leaderboard", leaderboard);
router.put("/timestamp", updateTimestamp);
router.get("/timestamp", getTimestamp);
router.post("/registerUserAnswer", registerUserAnswer);
router.get("/questionsStatistics", getQuestionsStatistics);
router.post("/clear", clear);
router.post("/resetTimer", resetTimer);
router.post("/resetGame", resetGame);

export default router;
