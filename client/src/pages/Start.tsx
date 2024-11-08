import { useContext, useEffect, useState } from "react";

// components
import { OutsideZoneModal, PageContainer, PageFooter, PlayerStatus } from "@/components";
import instructionsImg from "../assets/instructions-start.png";

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

        <img src={instructionsImg} style={{ width: "100%" }} />

        <h2 className="mt-4 text-center">Welcome to Quiz Race!</h2>
        <h3 className="mt-4 mb-2">How to play:</h3>
        <ol>
          <li>
            Click <b style={{ color: "green" }}>Start Quiz</b>.
          </li>
          <li>Run to each question zone, and click the question mark.</li>
          <li>Answer all questions (there are 4).</li>
        </ol>

        <h3 className="mt-4 mb-2">Important Rules:</h3>
        <ul>
          <li>You must be in the question zone to answer the question.</li>
          <li>
            <b>Time</b> starts when you click <b style={{ color: "green" }}>Start Quiz</b>.
          </li>
          <li>Check your rank by clicking the 🏆 leaderboard.</li>
        </ul>

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
