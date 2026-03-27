import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { PageContainer, PageFooter, PlayerStatus } from "@/components";

// pages
import { NotConfigured } from "./NotConfigured";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Start = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { isConfigured, playerStatus, hasInteractiveParams, quiz, visitor } = useContext(GlobalStateContext);
  const [searchParams] = useSearchParams();
  const forceRefreshInventory = searchParams.get("forceRefreshInventory") === "true";

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

  const restartQuiz = () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/start")
      .then((response) => {
        setGameState(dispatch, response.data);
        setAreButtonsDisabled(false);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTimeout = () => {
    backendAPI
      .post("/quiz/timeout")
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error));
  };

  // Determine what to render based on configuration state
  const renderContent = () => {
    // Not yet loaded
    if (isLoading || !quiz) return null;

    // Not configured
    if (!isConfigured) return <NotConfigured />;

    // Normal start page (legacy or configured)
    const settings = quiz?.settings;
    const replayMode = settings?.replayMode || "manual";
    const quizComplete = !!playerStatus?.endTime;

    return (
      <div className="grid gap-2">
        <>
          <img
            src="https://sdk-quiz.s3.us-east-1.amazonaws.com/instructions-start.png"
            style={{ width: "100%" }}
            alt="Quiz instructions"
          />

          <h2 className="text-center">Welcome to Quiz Race!</h2>

          <h3>How to play:</h3>
          <ol className="p2">
            <li>
              <b>Time</b> starts when you click <b className="text-success">Start Quiz</b>.
            </li>
            <li>Run to each question zone and answer the question.</li>
            <li>After answering all questions, check your rank by clicking the leaderboard.</li>
          </ol>

          {replayMode === "manual" && !quizComplete && (
            <p className="p3 text-muted">You can retake this quiz to improve your score or time.</p>
          )}

          {playerStatus && quiz && (
            <PlayerStatus
              playerStatus={playerStatus}
              numberOfQuestions={quiz.numberOfQuestions}
              replayMode={replayMode}
              timerDurationMinutes={settings?.timerDurationMinutes}
              onRestart={restartQuiz}
              onTimeout={handleTimeout}
            />
          )}

          {!quizComplete && (
            <PageFooter>
              <button className="btn" disabled={areButtonsDisabled} onClick={startQuiz} aria-label="Start the quiz">
                Start Quiz
              </button>
            </PageFooter>
          )}
        </>
      </div>
    );
  };

  return (
    <PageContainer isLoading={isLoading || !quiz} showAdminIcon={true}>
      {renderContent()}
    </PageContainer>
  );
};

export default Start;
