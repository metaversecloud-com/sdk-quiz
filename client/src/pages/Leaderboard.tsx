import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { Badges, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { LeaderboardEntryType } from "@/context/types";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

const downloadCSV = (leaderboard: LeaderboardEntryType[], numberOfQuestions: number) => {
  const headers = ["Rank", "Date", "Display Name", "Questions Answered", "Completed", "Score", "Time"];
  const rows = leaderboard.map((entry, index) => [
    index + 1,
    entry.completionDate ? new Date(entry.completionDate).toLocaleDateString() : "N/A",
    entry.displayName,
    entry.questionsAnswered ?? numberOfQuestions,
    entry.completed || "Y",
    `${entry.score}/${numberOfQuestions}`,
    entry.timeElapsed,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `quiz_leaderboard_${new Date().toISOString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const Leaderboard = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, quiz, leaderboard, visitor } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const forceRefreshInventory = searchParams.get("forceRefreshInventory") === "true";

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

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
              <div className="text-center mt-10 mb-6">There are no race finishes yet.</div>
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
                  <button
                    className="btn btn-outline mt-4"
                    onClick={() => downloadCSV(leaderboard, numberOfQuestions)}
                    aria-label="Download results as CSV"
                  >
                    Download CSV
                  </button>
                )}
              </>
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
