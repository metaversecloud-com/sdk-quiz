import { DroppedAsset, Visitor } from "../topiaInit.js";
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
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
