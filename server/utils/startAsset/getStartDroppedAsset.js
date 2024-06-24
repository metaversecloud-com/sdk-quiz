import { DroppedAsset, Visitor, World, WorldActivity } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getStartDroppedAsset = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      sceneDropId,
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

    // const droppedAssets = await world.fetchDroppedAssetsBySceneDropId({
    //   sceneDropId,
    // });

    // const visitors = await worldActivity.fetchVisitorsInZone({ droppedAssetId: keyAsset.dataObject.landmarkZoneId });

    // const landmarkZone = droppedAssets.find((asset) => {
    //   return assetId == asset.assetId;
    // });

    // const worldActivity = WorldActivity.create(credentials.urlSlug, {
    //   credentials,
    // });

    // const visitors = await worldActivity.fetchVisitorsInZone({
    //   droppedAssetId: assetId,
    // });

    // const visitors = await worldActivity.fetchVisitorsInZone(assetId);

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
