export const logger = {
  error: function ({ error, message, functionName, req }) {
    const { visitorId, assetId, interactivePublicKey, urlSlug } = req.query;

    const query = { visitorId, assetId, interactivePublicKey, urlSlug };

    console.error(
      JSON.stringify({
        errorContext: {
          message,
          functionName,
        },
        requestContext: {
          requestId: req.id,
          reqQueryParams: query,
          reqBody: req.body,
        },
        error: JSON.stringify(error),
      })
    );
  },
};
