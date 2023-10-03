import { logger } from "../logs/logger.js";

export function validationMiddleware(req, res, next) {
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
}
