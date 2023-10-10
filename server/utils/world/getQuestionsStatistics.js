import { Visitor } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";
import { logger } from "../../logs/logger.js";

export const getQuestionsStatistics = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const { questionAssets } = await getQuestionsAndLeaderboardStartAndAssets(
      req.query
    );

    const totalNumberOfQuestionsInQuiz = questionAssets?.length;

    const numberOfQuestionsAnswered = getNumberOfQuestionsAnswered(
      questionAssets,
      visitor?.profileId
    );

    return res.json({
      totalNumberOfQuestionsInQuiz,
      numberOfQuestionsAnswered,
    });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 📈 Error while getQuestionsStatistics",
      functionName: "getQuestionsStatistics",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function getNumberOfQuestionsAnswered(questions, visitorProfileId) {
  let numberOfQuestionsAnswered = 0;

  for (const question of questions) {
    if (question?.dataObject?.quiz?.results?.[visitorProfileId]) {
      numberOfQuestionsAnswered++;
    }
  }

  return numberOfQuestionsAnswered;
}
