import { Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";
export const reloadIframe = async (req, res) => {
  try {
    const {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    } = req.body;

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    await visitor?.reloadIframe(assetId);

    return res.json({ visitor, success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 📃 Error while reloading the iFrame with the webhook",
      functionName: "reloadIframe",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
