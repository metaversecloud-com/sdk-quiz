import { DroppedAsset, Visitor } from "../topiaInit.js";
import { getHasAnsweredAllQuestions } from "../utils.js";

export const registerUserAnswer = async (req, res) => {
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

    const { isCorrect, selectedOption } = req.body;

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

    const profileId = visitor?.profileId;

    await droppedAsset.fetchDataObject();

    if (!droppedAsset?.dataObject?.quiz) {
      droppedAsset.dataObject.quiz = {};
    }

    if (!droppedAsset?.dataObject?.quiz?.results) {
      droppedAsset.dataObject.quiz.results = {};
    }

    droppedAsset.dataObject.quiz.results[profileId] = {
      isCorrect,
      userAnswer: selectedOption,
      username: visitor?.username,
    };

    await droppedAsset.updateDataObject();

    const { hasAnsweredAllQuestions, startAsset } =
      await getHasAnsweredAllQuestions(req.query);

    if (!startAsset?.dataObject?.quiz?.[profileId]?.numberOfQuestionsAnswered) {
      startAsset.dataObject.quiz[profileId].numberOfQuestionsAnswered = 1;
    } else {
      startAsset.dataObject.quiz[profileId].numberOfQuestionsAnswered++;
    }

    if (hasAnsweredAllQuestions) {
      startAsset.dataObject.quiz[profileId].endTimestamp = Date.now();
    }

    await startAsset.updateDataObject();

    return res.json({
      droppedAsset,
      message: "Answer sucessfully registered",
      success: true,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        errorContext: {
          message: "❌ 📃 Error while registerUserAnswer",
          functionName: "registerUserAnswer",
        },
        requestContext: { requestId: req.id, reqQuery: req.query },
        error: JSON.stringify(error),
      })
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};
