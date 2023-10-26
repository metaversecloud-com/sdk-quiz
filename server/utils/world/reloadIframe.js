import { Visitor } from "../topiaInit.js";
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

    // await visitor.closeIframe(assetId);

    // const base_url = `https://${req.get("host")}`;
    // const link = `${base_url}/questions?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;

    // await visitor.openIframe({
    //   droppedAssetId: assetId,
    //   link,
    //   shouldOpenInDrawer: true,
    //   title: "Quiz Race",
    // });
    await visitor.reloadIframe(assetId);

    return res.json({ visitor, success: true });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
