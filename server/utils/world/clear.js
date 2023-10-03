import { DroppedAsset, Visitor } from "../topiaInit.js";
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
    console.error(
      JSON.stringify({
        errorContext: {
          message: "❌ Error while cleaning the game",
          functionName: "clear",
        },
        requestContext: { requestId: req.id, reqQuery: req.query },
        error: JSON.stringify(error),
      })
    );
    return res.status(500).send({ error, success: false });
  }
};
