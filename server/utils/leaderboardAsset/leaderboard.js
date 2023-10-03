import { getStartAsset } from "../questionAsset/utils.js";

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
    console.error(
      "❌ 🏆 Error getting the leaderboard: ",
      { requestId: req.id, reqQuery: req.query },
      JSON.stringify(error)
    );
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

  for (const result of quizResults) {
    for (const profileId in result) {
      const startTimestamp = quizMetaData?.[profileId]?.startTimestamp;
      const endTimestamp = quizMetaData?.[profileId]?.endTimestamp;

      if (!scoreData[profileId]) {
        scoreData[profileId] = {};
        scoreData[profileId].score = 0;
        scoreData[profileId].username = result[profileId].username;
        scoreData[profileId].timeElapsed = endTimestamp
          ? endTimestamp - startTimestamp
          : null;
      }

      if (result?.[profileId].isCorrect) {
        scoreData[profileId].score++;
      }
    }
  }

  const leaderboardArray = Object.keys(scoreData)?.map((profileId) => ({
    profileId: profileId,
    score: scoreData[profileId].score,
    username: scoreData[profileId].username,
    timeElapsed: scoreData[profileId].timeElapsed,
  }));

  const sortedLeaderboard = leaderboardArray?.sort((a, b) => {
    const scoreDifference = b.score - a.score;
    if (scoreDifference === 0) {
      const aTime = a.timeElapsed === null ? Infinity : a.timeElapsed;
      const bTime = b.timeElapsed === null ? Infinity : b.timeElapsed;

      return aTime - bTime;
    }

    return scoreDifference;
  });

  return sortedLeaderboard;
}
