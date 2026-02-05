export const sortLeaderboard = (leaderboard: Record<string, string>) => {
  const leaderboardArray = [];
  for (const profileId in leaderboard) {
    const data = leaderboard[profileId];

    const [displayName, score, timeElapsed] = data.split("|");

    leaderboardArray.push({
      profileId,
      displayName,
      score: parseInt(score),
      timeElapsed,
    });
  }

  const sortedLeaderboard = leaderboardArray.sort((a, b) => {
    const scoreDifference = b.score - a.score;
    if (scoreDifference === 0) {
      const parseTime = (time: string) => {
        const [minutes, seconds] = time.split(":").map(Number);
        return minutes * 60 + seconds;
      };
      const aTime = parseTime(a.timeElapsed);
      const bTime = parseTime(b.timeElapsed);
      return aTime - bTime;
    }
    return scoreDifference;
  });

  return sortedLeaderboard;
};
