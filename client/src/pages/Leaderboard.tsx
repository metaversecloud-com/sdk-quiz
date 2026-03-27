import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { Badges, PageContainer, ResetQuizModal } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { LeaderboardEntryType } from "@/context/types";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

const openResultsInNewTab = (leaderboard: LeaderboardEntryType[], numberOfQuestions: number) => {
  const rows = leaderboard
    .map(
      (entry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${new Date(entry.completionDate || "").toLocaleDateString() || "N/A"}</td>
        <td>${entry.displayName}</td>
        <td>${entry.questionsAnswered ?? numberOfQuestions}</td>
        <td>${entry.completed || "Y"}</td>
        <td>${entry.score}/${numberOfQuestions}</td>
        <td>${entry.timeElapsed}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head>
  <title>Quiz Results - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; color: #1a1a1a; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    @media print { body { margin: 0.5rem; } }
  </style>
</head><body>
  <h1>Quiz Results - ${new Date().toLocaleDateString()}</h1>
  <table>
    <thead><tr>
      <th>#</th><th>Date</th><th>Display Name</th><th>Questions Answered</th><th>Completed</th><th>Score</th><th>Time</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;

  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.write(html);
    newTab.document.close();
  }
};

export const Leaderboard = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, quiz, leaderboard, visitor } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const forceRefreshInventory = searchParams.get("forceRefreshInventory") === "true";

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz", { params: { forceRefreshInventory } })
        .then((response) => setGameState(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  const numberOfQuestions = quiz?.numberOfQuestions || 0;

  return (
    <PageContainer isLoading={isLoading}>
      <div className="grid gap-2">
        <div className="tab-container">
          <button
            className={activeTab === "leaderboard" ? "btn" : "btn btn-text"}
            onClick={() => setActiveTab("leaderboard")}
            aria-label="Leaderboard tab"
          >
            Leaderboard
          </button>
          <button
            className={activeTab === "badges" ? "btn" : "btn btn-text"}
            onClick={() => setActiveTab("badges")}
            aria-label="Badges tab"
          >
            Badges
          </button>
        </div>

        {activeTab === "leaderboard" ? (
          <>
            {!leaderboard || leaderboard.length === 0 ? (
              <div className="text-center mt-10 mb-6">
                <p>There are no race finishes yet.</p>
                {visitor?.isAdmin && (
                  <button
                    className="btn btn-danger mt-4"
                    onClick={() => setShowResetModal(true)}
                    aria-label="Reset quiz"
                  >
                    Reset Quiz
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className="table" role="table" aria-label="Leaderboard">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">User</th>
                      <th scope="col">Score</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.profileId}>
                        <td>{index + 1}</td>
                        <td>{entry.displayName}</td>
                        <td>
                          {entry.score}/{numberOfQuestions}
                        </td>
                        <td>{entry.timeElapsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visitor?.isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="btn btn-outline"
                      onClick={() => openResultsInNewTab(leaderboard, numberOfQuestions)}
                      aria-label="View full results in new tab"
                    >
                      View Results
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowResetModal(true)} aria-label="Reset quiz">
                      Reset Quiz
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Badges />
        )}
        {showResetModal && <ResetQuizModal handleToggleShowResetModal={() => setShowResetModal(false)} />}
      </div>
    </PageContainer>
  );
};

export default Leaderboard;
