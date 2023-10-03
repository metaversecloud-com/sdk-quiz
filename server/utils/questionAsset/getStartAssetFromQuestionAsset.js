import { getStartAsset } from "./utils.js";

export const getStartAssetFromQuestionAsset = async (req, res) => {
  try {
    const { startDroppedAsset, visitor, questionDroppedAsset } =
      await getStartAsset(req.query);

    return res.json({ startDroppedAsset, visitor, questionDroppedAsset });
  } catch (error) {
    console.error(
      JSON.stringify({
        errorContext: {
          message: "❌ 📪 Error getting the getStartAssetFromQuestionAsset",
          functionName: "getStartAssetFromQuestionAsset",
        },
        requestContext: { requestId: req.id, reqQuery: req.query },
        error: JSON.stringify(error),
      })
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};
