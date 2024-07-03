import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const loadGameState = async (req, res) => {
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

    const world = await World.create(urlSlug, { credentials });

    const result = await Promise.all([
      world.fetchDataObject(),
      Visitor.get(visitorId, urlSlug, { credentials }),
      DroppedAsset.get(assetId, urlSlug, { credentials }),
    ]);
    const visitor = result?.[1];
    const droppedAsset = result?.[2];

    return res.json({
      visitor,
      world,
      droppedAsset,
      inZone: visitor?.landmarkZonesString == assetId,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏃‍♂️ Error getting the loadGameState",
      functionName: "loadGameState",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
