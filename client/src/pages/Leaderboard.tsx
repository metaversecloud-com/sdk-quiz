import { useContext, useEffect, useState } from "react";

// components
import { PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, getLeaderboard, setErrorMessage, setQuiz } from "@/utils";
import { LeaderboardType } from "@/context/types";

export const Leaderboard = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, quiz } = useContext(GlobalStateContext);

  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardType[] | null>(null);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz")
        .then((response) => setQuiz(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  useEffect(() => {
    if (quiz) {
      setLeaderboard(getLeaderboard(quiz.results));
    }
  }, [quiz]);

  return (
    <PageContainer isLoading={isLoading} headerText="Leaderboard">
      {!leaderboard || leaderboard.length === 0 ? (
        <div className="text-center mt-10 mb-6">There are no race finishes yet.</div>
      ) : (
        <table className="table">
          <tbody>
            <tr>
              <th></th>
              <th>User</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>
                  {entry.score}/{quiz?.numberOfQuestions}
                </td>
                <td>{entry.timeElapsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PageContainer>
  );
};

export default Leaderboard;
