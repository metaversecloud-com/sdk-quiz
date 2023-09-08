import { DroppedAsset, Visitor, World } from "../topiaInit.js";

export const leaderboard = async (req, res) => {
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

    const leaderboardDroppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    const world = await World.create(urlSlug, { credentials });

    await world.fetchDroppedAssets();
    const assets = world.droppedAssets;

    const assetsThatBelongsToQuiz = Object.entries(assets)
      .filter(([key, value]) => {
        return belongsToQuiz(
          value.uniqueName,
          leaderboardDroppedAsset.uniqueName
        );
      })
      .map(async ([key, value]) => {
        await value.fetchDataObject();
        return value;
      });

    const result = await Promise.all(assetsThatBelongsToQuiz);

    const leaderboard = calculateLeaderboard(result);

    return res.json({
      leaderboard,
      success: true,
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

function calculateLeaderboard(questions) {
  const scoreData = {};

  for (const question of questions) {
    for (const profileId in question.dataObject.quiz.results) {
      if (!scoreData[profileId]) {
        scoreData[profileId] = {};
        scoreData[profileId].score = 0;
        scoreData[profileId].username =
          question.dataObject.quiz.results[profileId].username;
      }

      if (question.dataObject.quiz.results[profileId].isCorrect) {
        scoreData[profileId].score++;
      }
    }
  }

  const leaderboardArray = Object.keys(scoreData).map((profileId) => ({
    profileId: profileId,
    score: scoreData[profileId].score,
    username: scoreData[profileId].username,
  }));

  const sortedLeaderboard = leaderboardArray.sort((a, b) => b.score - a.score);

  return sortedLeaderboard;
}
