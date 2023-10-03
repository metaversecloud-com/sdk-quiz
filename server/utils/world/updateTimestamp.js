import { Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";
export const updateTimestamp = async (req, res) => {
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

    const now = Date.now();

    const { startAsset } = await getQuestionsAndLeaderboardStartAndAssets(
      req.query
    );

    await startAsset.fetchDataObject();

    if (!startAsset?.dataObject?.quiz) {
      startAsset.dataObject.quiz = {};
    }

    startAsset.dataObject.quiz[visitor.profileId] = {};
    startAsset.dataObject.quiz[visitor.profileId].startTimestamp = now;
    startAsset.updateDataObject();

    return res.json({
      startTimestamp:
        startAsset?.dataObject.quiz[visitor?.profileId].startTimestamp,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ ⌛ Error while updating the timestamp",
      functionName: "updateTimestamp",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
