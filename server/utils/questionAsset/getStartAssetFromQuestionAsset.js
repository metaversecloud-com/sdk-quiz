import { getStartAsset } from "./utils.js";
import { logger } from "../../logs/logger.js";

export const getStartAssetFromQuestionAsset = async (req, res) => {
  try {
    const { startDroppedAsset, visitor, questionDroppedAsset } =
      await getStartAsset(req.query);

    return res.json({
      startDroppedAsset,
      visitor,
      questionDroppedAsset,
      inPrivateZone: visitor?.privateZoneId == questionDroppedAsset?.id,
    });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ 📪 Error getting the getStartAssetFromQuestionAsset",
      functionName: "getStartAssetFromQuestionAsset",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
