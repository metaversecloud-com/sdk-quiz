import { Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";
export const openStartIframe = async (req, res) => {
  try {
    // const {
    //   visitorId,
    //   interactiveNonce,
    //   assetId,
    //   interactivePublicKey,
    //   urlSlug,
    // } = req.query;

    const {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      playerId,
    } = req.body;
    const visitorId = playerId;

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    await visitor?.closeIframe(assetId);

    const base_url = `https://${req.get("host")}`;
    const link = `${base_url}/start?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;

    await visitor?.openIframe({
      droppedAssetId: assetId,
      link,
      shouldOpenInDrawer: true,
      title: "Quiz Race",
    });

    return res.json({ visitor, success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 📃 Error while Opening and closing iframe due to webhook",
      functionName: "openStartIframe",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
