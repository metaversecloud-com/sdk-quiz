import { getStartAsset } from "../questionAsset/utils.js";
import { logger } from "../../logs/logger.js";

export const leaderboard = async (req, res) => {
  try {
    const { startDroppedAsset, visitor } = await getStartAsset(req.query);

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
