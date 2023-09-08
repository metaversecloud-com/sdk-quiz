import { DroppedAsset, Visitor } from "../topiaInit.js";

export const registerUserAnswer = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const { isCorrect, selectedOption } = req.body;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const profileId = visitor?.profileId;

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

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

    return res.json({
      droppedAsset,
      message: "Answer sucessfully registered",
      success: true,
    });
  } catch (error) {
    console.error("Error selecting the answer", error);
    return res.status(500).send({ error, success: false });
  }
};
