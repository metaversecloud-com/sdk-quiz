import { Visitor } from "../topiaInit.js";
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

    const link = `https://9bce-2804-2894-f00e-3500-8557-3ac3-95ab-aa.ngrok-free.app/start?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;
    await visitor.openIframe({
      link,
      shouldOpenInDrawer: false,
      title: "Quiz Race",
    });

    return res.json({ visitor, success: true });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
