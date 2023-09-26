import { DroppedAsset, Visitor } from "../topiaInit.js";
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
    console.error("Error getting the visitor", error);
    return res
      .status(500)
      .send({ error: JSON.stringify(error), success: false });
  }
};
