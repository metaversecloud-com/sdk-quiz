import { DroppedAsset, Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getDroppedAssets = async (req, res) => {
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

    return res.json({ droppedAsset, visitor });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 📪 Error while getDroppedAsset",
      functionName: "getDroppedAsset",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
