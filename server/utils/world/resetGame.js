import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";
import { logger } from "../../logs/logger.js";

export const resetGame = async (req, res) => {
  try {
    const { questionAssets, startAsset } =
      await getQuestionsAndLeaderboardStartAndAssets(req.query);

    startAsset.dataObject.quiz = null;
    await startAsset.updateDataObject();

    startAsset.dataObject.quiz = {};
    startAsset.dataObject.quiz.numberOfQuestionsThatBelongToQuiz =
      questionAssets.length;

    startAsset.dataObject.quiz.results = new Array(questionAssets.length);

    await startAsset.updateDataObject();

    for (const question of questionAssets) {
      question.dataObject.quiz = null;
      await question.updateDataObject();
    }

    return res.json({ startAsset, sucess: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🧹 Error while resetting the game",
      functionName: "resetGame",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
