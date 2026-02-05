import { useContext, useEffect, useState } from "react";

// components
import { PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Leaderboard = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, quiz, leaderboard, badges, visitorInventory } = useContext(GlobalStateContext);

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
          <div className="grid grid-cols-3 gap-6 pt-4">
            {badges &&
              Object.values(badges).map((badge) => {
                const hasBadge = visitorInventory && Object.keys(visitorInventory).includes(badge.name);
                const style = { width: "90px", filter: "none" };
                if (!hasBadge) style.filter = "grayscale(1)";
                return (
                  <div className="tooltip" key={badge.id}>
                    <span className="tooltip-content">{badge.name}</span>
                    <img src={badge.icon} alt={badge.name} style={style} />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Leaderboard;
