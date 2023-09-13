import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "./utils.js";

export const getQuestionsStatistics = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

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
    console.error("Error selecting the answer", error);
    return res.status(500).send({ error, success: false });
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
