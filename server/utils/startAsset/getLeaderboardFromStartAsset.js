import { DroppedAsset, Visitor } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getLeaderboardFromStartAsset = async (req, res) => {
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

    const startDroppedAsset = result?.[0];
    const visitor = result?.[1];

    const leaderboard = calculateLeaderboard(startDroppedAsset);

    return res.json({
      leaderboard,
      startDroppedAsset,
      visitor,
      success: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏆 Error getting the leaderboard",
      functionName: "leaderboard",
      req,
    });
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function calculateLeaderboard(startAsset) {
  const scoreData = {};

  const quizResults = startAsset?.dataObject?.quiz?.results;
  const quizMetaData = startAsset?.dataObject?.quiz;

  if (!quizResults) {
    return null;
  }

  for (const [profileId, results] of Object.entries(quizResults)) {
    const startTimestamp = quizMetaData?.[profileId]?.startTimestamp;
    const endTimestamp = quizMetaData?.[profileId]?.endTimestamp;

    if (!endTimestamp) continue;

    if (!scoreData[profileId]) {
      const username = results[Object.keys(results)[0]].username;
      scoreData[profileId] = {
        score: 0,
        username: username,
        timeElapsed: endTimestamp - startTimestamp,
      };
    }

    for (const questionId in results) {
      if (results[questionId].isCorrect) {
        scoreData[profileId].score++;
      }
    }
  }

  const leaderboardArray = Object.values(scoreData);
  const sortedLeaderboard = leaderboardArray.sort((a, b) => {
    const scoreDifference = b.score - a.score;
    if (scoreDifference === 0) {
      const aTime = a.timeElapsed || Infinity;
      const bTime = b.timeElapsed || Infinity;
      return aTime - bTime;
    }
    return scoreDifference;
  });

  return sortedLeaderboard;
}
