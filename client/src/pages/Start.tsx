import { useContext, useEffect, useState } from "react";

// components
import { OutsideZoneModal, PageContainer, PageFooter, PlayerStatus } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Start = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { playerStatus, hasInteractiveParams, quiz, visitor } = useContext(GlobalStateContext);

  const [isLoading, setIsLoading] = useState(true);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz?isStartAsset=true")
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
      <>
        {!visitor?.isInZone && <OutsideZoneModal />}

        <img src="https://sdk-quiz.s3.us-east-1.amazonaws.com/instructions-start.png" style={{ width: "100%" }} />

        <h2 className="mt-4 text-center">Welcome to Quiz Race!</h2>
        <h3 className="mt-4 mb-2">How to play:</h3>
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
    </PageContainer>
  );
};

export default Start;
