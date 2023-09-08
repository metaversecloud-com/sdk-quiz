import express from "express";
import {
  getDroppedAssets,
  getVisitor,
  getOrUpdateTimestamp,
  getTimestamp,
  registerUserAnswer,
  clear,
  leaderboard,
  getQuestionsAnsweredFromStart,
} from "./utils/index.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/dropped-asset", getDroppedAssets);
router.get("/visitor", getVisitor);
router.get("/leaderboard", leaderboard);
router.put("/timestamp", getOrUpdateTimestamp);
router.get("/timestamp", getTimestamp);
router.post("/registerUserAnswer", registerUserAnswer);
router.get("/questionsAnsweredFromStart", getQuestionsAnsweredFromStart);
router.post("/clear", clear);

export default router;
