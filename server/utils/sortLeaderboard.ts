export const sortLeaderboard = (leaderboard: Record<string, string>) => {
  const leaderboardArray = [];
  for (const profileId in leaderboard) {
    const data = leaderboard[profileId];

    // Format: "displayName|score|timeElapsed" (legacy)
    // or: "displayName|score|timeElapsed|completionDate|questionsAnswered|completed" (new)
    const parts = data.split("|");
    const [displayName, score, timeElapsed, completionDate, questionsAnswered, completed] = parts;

    leaderboardArray.push({
      profileId,
      displayName,
      score: parseInt(score),
      timeElapsed,
      completionDate: completionDate || undefined,
      questionsAnswered: questionsAnswered ? parseInt(questionsAnswered) : undefined,
      completed: completed || "Y",
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
