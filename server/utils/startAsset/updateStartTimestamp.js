import { Visitor, DroppedAsset } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const updateStartTimestamp = async (req, res) => {
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

    const startAsset = result?.[0];
    const visitor = result?.[1];

    const now = Date.now();

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
      functionName: "updateStartTimestamp",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
