import { useContext, useEffect, useState } from "react";

// components
import { Badges, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Leaderboard = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, quiz, leaderboard } = useContext(GlobalStateContext);

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz")
        .then((response) => setGameState(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading} showAdminIcon={true}>
      <div className="grid gap-2">
        <div className="tab-container">
          <button
            className={activeTab === "leaderboard" ? "btn" : "btn btn-text"}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </button>
          <button className={activeTab === "badges" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("badges")}>
            Badges
          </button>
        </div>

        {activeTab === "leaderboard" ? (
          <>
            {!leaderboard || Object.keys(leaderboard).length === 0 ? (
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
                  {Object.entries(leaderboard).map(([profileId, entry], index) => (
                    <tr key={profileId}>
                      <td>{index + 1}</td>
                      <td>{entry.displayName}</td>
                      <td>
                        {entry.score}/{quiz?.numberOfQuestions}
                      </td>
                      <td>{entry.timeElapsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <Badges />
        )}
      </div>
    </PageContainer>
  );
};

export default Leaderboard;
