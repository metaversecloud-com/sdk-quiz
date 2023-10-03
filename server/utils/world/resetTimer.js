import { DroppedAsset } from "../topiaInit.js";
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
    console.error(
      "❌ ⌛ Error while resetting the timer: ",
      { requestId: req.id, reqQuery: req.query, reqBody: req.body },
      JSON.stringify(error)
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};
