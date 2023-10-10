import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";
import { logger } from "../../logs/logger.js";

export const resetGame = async (req, res) => {
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
      credentials,
    });

    if (!visitor?.isAdmin) {
      return res
        .status(401)
        .json({ error: { message: "User is not an admin" } });
    }

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

    return res.json({ startAsset, sucess: true, gameResetFlag: true });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 🧹 Error while resetting the game",
      functionName: "resetGame",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
