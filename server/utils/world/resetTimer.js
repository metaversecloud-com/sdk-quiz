import { DroppedAsset } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const resetTimer = async (req, res) => {
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

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    droppedAsset.dataObject.quiz = null;
    await droppedAsset.updateDataObject();

    return res.json({ droppedAsset });
  } catch (error) {
    logger.error({
      error,
      message: "❌ ⌛ Error while resetting the timer",
      functionName: "resetTimer",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
