import express from "express";
import {
  handleAnswerQuestion,
  handleGetQuiz,
  handleOpenIframe,
  handleResetQuiz,
  handleStartQuiz,
  handleUpdateQuestion,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

const router = express.Router();
const SERVER_START_DATE = new Date();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
    },
  });
});

router.get("/quiz", handleGetQuiz);
router.put("/start", handleStartQuiz);
router.post("/question/answer/:questionId", handleAnswerQuestion);

// Admin
router.put("/admin/update-question", handleUpdateQuestion);
router.post("/admin/reset", handleResetQuiz);

// Webhooks
router.post("/iframe/:iframeId", handleOpenIframe);

export default router;
