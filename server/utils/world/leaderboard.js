import { DroppedAsset, Visitor, World } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";

export const leaderboard = async (req, res) => {
  try {
    const { questionAssets, startAsset } =
      await getQuestionsAndLeaderboardStartAndAssets(req.query);

    const leaderboard = calculateLeaderboard(questionAssets, startAsset);

    return res.json({
      leaderboard,
      success: true,
    });
  } catch (error) {
    console.error(
      "❌ 🏗️ Error while getting the leaderboard: ",
      { requestId: req.id, reqQuery: req.query, reqBody: req.body },
      JSON.stringify(error)
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function calculateLeaderboard(questions, startAsset) {
  const scoreData = {};

  for (const question of questions) {
    if (!question.dataObject.quiz) {
      return null;
    }
    for (const profileId in question.dataObject.quiz.results) {
      const startTimestamp =
        startAsset?.dataObject?.quiz?.[profileId]?.startTimestamp;
      const endTimestamp =
        startAsset?.dataObject?.quiz?.[profileId]?.endTimestamp;

      if (!scoreData[profileId]) {
        scoreData[profileId] = {};
        scoreData[profileId].score = 0;
        scoreData[profileId].username =
          question.dataObject.quiz.results[profileId].username;
        scoreData[profileId].timeElapsed = endTimestamp
          ? endTimestamp - startTimestamp
          : null;
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
    timeElapsed: scoreData[profileId].timeElapsed,
  }));

  const sortedLeaderboard = leaderboardArray.sort((a, b) => {
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
