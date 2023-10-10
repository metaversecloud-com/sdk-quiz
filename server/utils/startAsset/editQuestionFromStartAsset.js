import { DroppedAsset, Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";
import { getQuizName } from "../utils.js";

export const editQuestionFromStartAsset = async (req, res) => {
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

    const droppedAssetPromise = DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    const visitorPromise = Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const result = await Promise.all([droppedAssetPromise, visitorPromise]);

    const droppedAsset = result?.[0];
    const visitor = result?.[1];

    const quizName = getQuizName(droppedAsset?.uniqueName);

    const world = await World.create(urlSlug, { credentials });

    const allQuestions = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${quizName}-question-`,
      isPartial: true,
    });

    return res.json({ droppedAsset, visitor });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 🏃‍♂️ Error getting the getStartDroppedAsset",
      functionName: "getStartDroppedAsset",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
