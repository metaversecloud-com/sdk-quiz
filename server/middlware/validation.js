import { logger } from "../logs/logger.js";

export function validationMiddleware(req, res, next) {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
    } = req.query;

    if (
      !assetId ||
      assetId === "null" ||
      !interactivePublicKey ||
      interactivePublicKey === "null" ||
      !interactiveNonce ||
      interactiveNonce === "null" ||
      !urlSlug ||
      urlSlug === "null" ||
      !visitorId ||
      visitorId === "null"
    ) {
      logger.error({
        error: null,
        message:
          "❌ 📪 Missing required data in the request: 'assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId",
        functionName: "validationMiddleware",
        req,
      });
      return res.status(400).json({
        error:
          "❌ Missing required data in the request: 'assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId'",
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "❌❌❌ Unexpected error in validationMiddleware",
    });
  }
}
