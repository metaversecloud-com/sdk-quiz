import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";
import { getQuizName } from "../utils.js";

export const updateQuestion = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const { questionNumber, updatedQuestion } = req.body;

    if ((!questionNumber && questionNumber != 0) || !updatedQuestion) {
      return res.status(400).json({
        message: "❌ 🫙 Missing questionNumber or updatedQuestion fields",
      });
    }

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const droppedAssetPromise = DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    const visitorPromise = Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const result = await Promise.all([droppedAssetPromise, visitorPromise]);

    const droppedAsset = result?.[0];
    const visitor = result?.[1];

    if (!visitor?.isAdmin) {
      return res
        .status(401)
        .json({ error: { message: "User is not an admin" } });
    }

    const quizName = getQuizName(droppedAsset?.uniqueName);

    const world = await World.create(urlSlug, { credentials });

    const allQuestionAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${quizName}-question-`,
      isPartial: true,
    });

    const question = allQuestionAssets.filter(
      (q) => q.uniqueName == `${quizName}-question-${questionNumber}`
    );

    if (question?.length > 0) {
      await question[0].setDataObject(updatedQuestion);
    } else {
      return res.status(404).json({ message: "Question not found" });
    }

    const fetchDataObjectForQuestionPromises = [];
    for (const questionAsset of allQuestionAssets) {
      fetchDataObjectForQuestionPromises.push(questionAsset.fetchDataObject());
    }

    const allQuestionAssetsWithDataObject = await Promise.all(
      fetchDataObjectForQuestionPromises
    );

    return res.json({
      questionAsset: question?.[0],
      allQuestionAssets: allQuestionAssetsWithDataObject,
      droppedAsset,
      visitor,
    });
  } catch (error) {
    logger.error({
      error: JSON.stringify(error),
      message: "❌ Unexpected Error in updateQuestion",
      functionName: "updateQuestion",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};
