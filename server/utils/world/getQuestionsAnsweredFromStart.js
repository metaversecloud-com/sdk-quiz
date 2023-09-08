import { DroppedAsset, Visitor, World } from "../topiaInit.js";

export const getQuestionsAnsweredFromStart = async (req, res) => {
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

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    const uniqueName = droppedAsset.uniqueName;

    const leaderboardDroppedAssetUniqueName =
      extractQuizLeaderboardName(uniqueName);

    const world = await World.create(urlSlug, { credentials });

    await world.fetchDroppedAssets();
    const assets = world.droppedAssets;

    const assetsThatBelongsToQuiz = Object.entries(assets)
      .filter(([key, value]) => {
        return belongsToQuiz(
          value.uniqueName,
          leaderboardDroppedAssetUniqueName
        );
      })
      .map(async ([key, value]) => {
        await value.fetchDataObject();
        return value;
      });

    const result = await Promise.all(assetsThatBelongsToQuiz);

    const totalNumberOfQuestionsInQuiz = result?.length;
    const numberOfQuestionsAnswered = getNumberOfQuestionsAnswered(
      result,
      visitor?.profileId
    );

    return res.json({
      totalNumberOfQuestionsInQuiz,
      numberOfQuestionsAnswered,
    });
  } catch (error) {
    console.error("Error selecting the answer", error);
    return res.status(500).send({ error, success: false });
  }
};

function belongsToQuiz(assetUniqueName, quizUniqueName) {
  const regex = new RegExp(`^-?\\w+-belongsTo-${quizUniqueName}$`);

  return regex.test(assetUniqueName);
}

function getNumberOfQuestionsAnswered(questions, visitorProfileId) {
  let numberOfQuestionsAnswered = 0;

  for (const question of questions) {
    if (question?.dataObject?.quiz?.results?.[visitorProfileId]) {
      numberOfQuestionsAnswered++;
    }
  }

  return numberOfQuestionsAnswered;
}

function extractQuizLeaderboardName(str) {
  let parts = str.split("-");
  if (parts.length > 1) {
    return parts[1];
  } else {
    return null;
  }
}
