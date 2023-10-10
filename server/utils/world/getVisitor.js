import { Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

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
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 🏗️ Error while getting the visitor",
      functionName: "getVisitor",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
