import { DroppedAsset, Visitor } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "./utils.js";

export const resetGame = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { questionAssets, startAsset } =
      await getQuestionsAndLeaderboardStartAndAssets(req.query);

    startAsset.dataObject.quiz = null;
    await startAsset.updateDataObject();

    for (const question of questionAssets) {
      question.dataObject.quiz = null;
      await question.updateDataObject();
    }

    return res.json({ message: "Game Reset", sucess: true });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
