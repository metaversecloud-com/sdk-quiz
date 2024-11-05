import { useContext, useEffect, useState } from "react";

// components
import { OutsideZoneModal, PageContainer, PageFooter, Timer } from "@/components";
import instructionsImg from "../assets/instructions-start.png";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setQuiz } from "@/utils";

export const Start = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { gameStatus, hasInteractiveParams, quiz, visitor } = useContext(GlobalStateContext);
  const { answers, endTime, startTime, timeElapsed } = gameStatus || {};

  const [isLoading, setIsLoading] = useState(true);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz?isStartAsset=true")
        .then((response) => setQuiz(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  useEffect(() => {
    if (!visitor) return;

    if (answers) {
      let correctAnswers = 0;
      Object.values(answers)?.forEach((item) => {
        if (item && item?.isCorrect) correctAnswers++;
      });
      setCorrectAnswersCount(correctAnswers);
      setAreButtonsDisabled(true);
    }
  }, [quiz, visitor]);

  const startQuiz = () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/start")
      .then((response) => setQuiz(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <PageContainer isLoading={isLoading || !quiz}>
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

        {answers && startTime && !endTime && (
          <div className="text-center mt-6">
            <hr />
            <h3 className="mt-6">Quiz in progress!</h3>
            <div className="mt-3 mb-3">
              <Timer startTime={startTime} />
            </div>
            Questions completed: {Object.keys(answers).length} / {quiz?.numberOfQuestions}
          </div>
        )}

        {endTime && (
          <div className="text-center mt-6">
            <h3>Hooray, quiz complete!</h3>
            <p className="mt-3 mb-3">See how you stack up against others on the leaderboard!</p>
            <h4>Your result:</h4>
            <div className="chip chip-success">
              {correctAnswersCount} / {quiz?.numberOfQuestions} correct in {timeElapsed}
            </div>
          </div>
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
