import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";
import { getQuizName } from "../utils.js";

export const getAllQuestionAssets = async (req, res) => {
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

    const allQuestionAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${quizName}-question-`,
      isPartial: true,
    });

    const fetchDataObjectForQuestionPromises = [];
    for (const questionAsset of allQuestionAssets) {
      fetchDataObjectForQuestionPromises.push(questionAsset.fetchDataObject());
    }

    const allQuestionAssetsWithDataObject = await Promise.all(
      fetchDataObjectForQuestionPromises
    );

    return res.json({
      allQuestions: allQuestionAssetsWithDataObject,
      droppedAsset,
      visitor,
    });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ Error getting getAllQuestionAssetsFromStart",
      functionName: "getAllQuestionAssetsFromStart",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
