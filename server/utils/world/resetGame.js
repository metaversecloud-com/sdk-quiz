import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";

export const resetGame = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const { questionAssets, startAsset } =
      await getQuestionsAndLeaderboardStartAndAssets(req.query);

    startAsset.dataObject.quiz = null;
    await startAsset.updateDataObject();

    startAsset.dataObject.quiz = {};
    startAsset.dataObject.quiz.numberOfQuestionsThatBelongToQuiz =
      questionAssets.length;

    startAsset.dataObject.quiz.results = new Array(questionAssets.length);

    await startAsset.updateDataObject();

    for (const question of questionAssets) {
      question.dataObject.quiz = null;
      await question.updateDataObject();
    }

    return res.json({ message: "Game Reset", sucess: true });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res
      .status(500)
      .json({ error: JSON.stringify(error), success: false });
  }
};
