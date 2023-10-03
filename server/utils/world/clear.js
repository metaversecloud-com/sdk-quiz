import { DroppedAsset, Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const clear = async (req, res) => {
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

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const now = Date.now();

    await visitor.setDataObject({ quiz: { start_timestamp: now } });

    return res.json({ droppedAsset });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while cleaning the game",
      functionName: "clear",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
