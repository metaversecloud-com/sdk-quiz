import { getStartAsset } from "./utils.js";
import { logger } from "../../logs/logger.js";

export const getStartAssetFromQuestionAsset = async (req, res) => {
  try {
    const { startDroppedAsset, visitor, questionDroppedAsset } = await getStartAsset(req.query);

    let inZone = false;
    const landmarkZonesArray = visitor?.landmarkZonesString.split(",");
    if (landmarkZonesArray.includes(questionDroppedAsset?.id) || visitor?.privateZoneId === questionDroppedAsset?.id)
      inZone = true;

    return res.json({
      startDroppedAsset,
      visitor,
      questionDroppedAsset,
      inZone,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏆 Error getting the getStartAssetFromQuestionAsset",
      functionName: "getStartAssetFromQuestionAsset",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
