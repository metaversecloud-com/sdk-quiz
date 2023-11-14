import { getStartAsset } from "./utils.js";
import { logger } from "../../logs/logger.js";

export const registerUserAnswer = async (req, res) => {
  try {
    const { isCorrect, selectedOption } = req.body;

    const { startDroppedAsset, visitor, questionDroppedAsset } =
      await getStartAsset(req.query);

    const profileId = visitor?.profileId;

    const hasAnsweredAllQuestions = checkAllAnswered(
      startDroppedAsset,
      profileId
    );

    const questionUniqueName = questionDroppedAsset?.uniqueName;
    const questionNumber = extractQuestionNumber(questionUniqueName);

    const updateObject = {};

    updateObject[`quiz.results.${profileId}.question-${questionNumber}`] = {
      isCorrect,
      userAnswer: selectedOption,
      username: visitor?.username,
    };

    updateObject[`quiz.${profileId}.endTimestamp`] = hasAnsweredAllQuestions
      ? Date.now()
      : null;

    await startDroppedAsset.updateDataObject(updateObject);

    return res.json({
      startDroppedAsset,
      questionDroppedAsset,
      visitor,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ ⛏️ Error in registerUserAnswer the answer",
      functionName: "registerUserAnswer",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function checkAllAnswered(startDroppedAsset, profileId) {
  const questions = Object.values(
    startDroppedAsset?.dataObject?.quiz?.results[profileId]
  );

  if (
    !questions ||
    questions.length <
      startDroppedAsset.dataObject.quiz.numberOfQuestionsThatBelongToQuiz - 1
  ) {
    return false;
  }

  // for (let question of questions) {
  //   if (!question) {
  //     return false;
  //   }

  //   if (!question[profileId]) {
  //     return false;
  //   }
  // }
  return true;
}

function extractQuestionNumber(str) {
  const parts = str.split("-");
  if (parts?.length > 2 && !isNaN(parts[2])) {
    return parseInt(parts[2], 10);
  }
  return null;
}
