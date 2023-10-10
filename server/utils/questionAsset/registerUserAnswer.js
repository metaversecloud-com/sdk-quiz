import { getStartAsset } from "./utils.js";
import { logger } from "../../logs/logger.js";

export const registerUserAnswer = async (req, res) => {
  try {
    const { isCorrect, selectedOption } = req.body;

    const { startDroppedAsset, visitor, questionDroppedAsset } =
      await getStartAsset(req.query);

    const questionUniqueName = questionDroppedAsset?.uniqueName;
    const questionNumber = extractQuestionNumber(questionUniqueName);

    const profileId = visitor?.profileId;

    if (!startDroppedAsset?.dataObject?.quiz) {
      startDroppedAsset.dataObject.quiz = {};
    }

    if (!startDroppedAsset?.dataObject?.quiz?.results) {
      startDroppedAsset.dataObject.quiz.results = [];
    }

    if (!startDroppedAsset?.dataObject?.quiz?.results?.[questionNumber]) {
      startDroppedAsset.dataObject.quiz.results[questionNumber] = {};
    }

    startDroppedAsset.dataObject.quiz.results[questionNumber][profileId] = {
      isCorrect,
      userAnswer: selectedOption,
      username: visitor?.username,
    };

    const hasAnsweredAllQuestions = checkAllAnswered(
      startDroppedAsset,
      profileId
    );

    if (hasAnsweredAllQuestions) {
      startDroppedAsset.dataObject.quiz[profileId].endTimestamp = Date.now();
    }

    await startDroppedAsset.updateDataObject();

    return res.json({
      startDroppedAsset,
      questionDroppedAsset,
      visitor,
    });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ ⛏️ Error in registerUserAnswer the answer",
      functionName: "registerUserAnswer",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function extractQuestionNumber(str) {
  const parts = str.split("-");

  if (parts?.length > 2 && !isNaN(parts[2])) {
    return parseInt(parts[2], 10);
  }

  return null;
}

function checkAllAnswered(startDroppedAsset, profileId) {
  const questions = startDroppedAsset?.dataObject?.quiz?.results;

  if (!questions) return false;

  for (let question of questions) {
    if (!question) {
      return false;
    }

    if (!question[profileId]) {
      return false;
    }
  }
  return true;
}
