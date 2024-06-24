import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getStartDroppedAsset = async (req, res) => {
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

    const world = World.create(urlSlug, {
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    return res.json({
      droppedAsset,
      visitor,
      inPrivateZone: visitor?.landmarkZonesString == droppedAsset?.id,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏃‍♂️ Error getting the getStartDroppedAsset",
      functionName: "getStartDroppedAsset",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
