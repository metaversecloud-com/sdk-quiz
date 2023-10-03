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
    console.error(
      "❌ 📪 Missing required data in the request: 'assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId ",
      { requestId: req.id, reqQuery: req.query, reqBody: req.body }
    );
    const log = JSON.stringify({
      error:
        "❌ 📪 Missing required data in the request: 'assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId ",
      request: { requestId: req.id, reqQuery: req.query, reqBody: req.body },
    });
    return res.status(400).json({
      error:
        "❌ Missing required data in the request: 'assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId'",
    });
  } else {
    next();
  }
}
