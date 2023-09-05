import { DroppedAsset } from "../topiaInit.js";
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

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    return res.json({ droppedAsset });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
