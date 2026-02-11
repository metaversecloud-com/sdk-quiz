import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { Badges, OutsideZoneModal, PageContainer, PageFooter, PlayerStatus } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Start = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { playerStatus, hasInteractiveParams, quiz, visitor } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const forceRefreshInventory = searchParams.get("forceRefreshInventory") === "true";

  const [activeTab, setActiveTab] = useState("instructions");
  const [isLoading, setIsLoading] = useState(true);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz", { params: { isStartAsset: true, forceRefreshInventory } })
        .then((response) => setGameState(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  useEffect(() => {
    if (!visitor) return;
    if (playerStatus?.startTime) setAreButtonsDisabled(true);
  }, [playerStatus, visitor]);

  const startQuiz = () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/start")
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <PageContainer isLoading={isLoading || !quiz} showAdminIcon={true}>
      <div className="grid gap-2">
        {!visitor?.isInZone && <OutsideZoneModal />}

        <div className="tab-container">
          <button
            className={activeTab === "instructions" ? "btn" : "btn btn-text"}
            onClick={() => setActiveTab("instructions")}
          >
            Instructions
          </button>
          <button className={activeTab === "badges" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("badges")}>
            Badges
          </button>
        </div>

        {activeTab === "instructions" ? (
          <>
            <img src="https://sdk-quiz.s3.us-east-1.amazonaws.com/instructions-start.png" style={{ width: "100%" }} />

            <h2 className="text-center">Welcome to Quiz Race!</h2>
            <h3>How to play:</h3>
            <ol className="p2">
              <li>
                <b>Time</b> starts when you click <b className="text-success">Start Quiz</b>.
              </li>
              <li>Run to each question zone and answer the question.</li>
              <li>After answering all questions, check your rank by clicking the 🏆 leaderboard.</li>
            </ol>

            {playerStatus && quiz && (
              <PlayerStatus playerStatus={playerStatus} numberOfQuestions={quiz.numberOfQuestions} />
            )}

            <PageFooter>
              <button className="btn" disabled={areButtonsDisabled} onClick={startQuiz}>
                Start Quiz
              </button>
            </PageFooter>
          </>
        ) : (
          <Badges />
        )}
      </div>
    </PageContainer>
  );
};

export default Start;
