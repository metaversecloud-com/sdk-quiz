import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { getStartAsset } from "./utils.js";

export const getStartAssetFromQuestionAsset = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const { startDroppedAsset, visitor, questionDroppedAsset } =
      await getStartAsset(req.query);

    return res.json({ startDroppedAsset, visitor, questionDroppedAsset });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
