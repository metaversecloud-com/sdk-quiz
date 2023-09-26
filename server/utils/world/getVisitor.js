import { Visitor } from "../topiaInit.js";
export const getVisitor = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;
    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    await visitor.fetchDataObject();

    return res.json({ visitor, success: true });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res
      .status(500)
      .send({ error: JSON.stringify(error), success: false });
  }
};
