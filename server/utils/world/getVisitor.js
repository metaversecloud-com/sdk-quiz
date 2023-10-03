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
    console.error(
      JSON.stringify({
        errorContext: {
          message: "❌ 🏗️ Error while getting the visitor",
          functionName: "getVisitor",
        },
        requestContext: { requestId: req.id, reqQuery: req.query },
        error: JSON.stringify(error),
      })
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};
