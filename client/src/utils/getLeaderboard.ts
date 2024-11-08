import { LeaderboardType, ResultsType } from "@/context/types";

export const getLeaderboard = (results: { [profileId: string]: ResultsType }) => {
  if (!results) return null;

  const scoreData: { [profileId: string]: LeaderboardType } = {};

  for (const [profileId, result] of Object.entries(results)) {
    const { answers, timeElapsed, username } = result;
    if (!timeElapsed) continue;

    if (!scoreData[profileId]) {
      scoreData[profileId] = {
        score: 0,
        username,
        timeElapsed,
      };
    }

    for (const questionId in answers) {
      if (answers[questionId].isCorrect) scoreData[profileId].score++;
    }
  }

  const leaderboardArray = Object.values(scoreData);
  const sortedLeaderboard = leaderboardArray.sort((a, b) => {
    const scoreDifference = b.score - a.score;
    if (scoreDifference === 0) {
      const aTime = new Date(a.timeElapsed).getTime();
      const bTime = new Date(b.timeElapsed).getTime();
      return aTime - bTime;
    }
    return scoreDifference;
  });

  return sortedLeaderboard;
};
