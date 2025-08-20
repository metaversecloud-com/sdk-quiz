import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { OutsideZoneModal, PageContainer, PlayerStatus } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { QuestionType } from "@/context/types";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Question = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { playerStatus, hasInteractiveParams, quiz, visitor } = useContext(GlobalStateContext);
  const { answers, startTime } = playerStatus || {};

  const [searchParams] = useSearchParams();
  const questionId = searchParams.get("questionId") || searchParams.get("questionid") || searchParams.get("uniqueName");

  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionType>();
  const [correctOption, setCorrectOption] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);

  const selectOption = (selectedOption: string) => {
    setSelectedOption(selectedOption);

    backendAPI
      .post(`/question/answer/${questionId}`, { isCorrect: correctOption === selectedOption, selectedOption })
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error));
  };

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quiz")
        .then((response) => setGameState(dispatch, response.data))
        .catch((error) => setErrorMessage(dispatch, error));
    }
  }, [hasInteractiveParams]);

  useEffect(() => {
    if (quiz && questionId) {
      setQuestion(quiz.questions[questionId]);

      for (const optionId of Object.keys(quiz.questions[questionId].options)) {
        if (optionId === quiz.questions[questionId].answer) setCorrectOption(optionId);
      }

      if (answers?.[questionId]) setSelectedOption(answers?.[questionId].answer);

      setIsLoading(false);
    }
  }, [quiz, questionId]);

  return (
    <PageContainer isLoading={isLoading || !quiz}>
      <>
        {!visitor?.isInZone && <OutsideZoneModal />}

        {!startTime ? (
          <div className="mt-10 m-3 text-center">
            <h3>Quiz race not started</h3>
            <br />
            <p>Please go to the start zone and start the quiz race.</p>
          </div>
        ) : !question ? (
          <p className="m-3">We're having trouble loading this question. Please try back again later.</p>
        ) : (
          <>
            <h3>{question.questionText}</h3>

            {Object.keys(question.options).map((optionId: string) => (
              <div className="flex mt-6" key={optionId}>
                <input
                  className="input-radio  mr-2"
                  defaultChecked={optionId === selectedOption}
                  disabled={selectedOption !== undefined}
                  name="selectedOption"
                  onChange={() => selectOption(optionId)}
                  style={{ height: 20 }}
                  type="radio"
                />
                {question.options[optionId]}
              </div>
            ))}

            {selectedOption && (
              <div className="text-center mt-10 mb-6">
                <hr />
                {selectedOption === correctOption ? (
                  <p className="pt-6 text-success">You're a genius!</p>
                ) : (
                  <>
                    <p className="pt-6 pb-3">Nice try! Mistakes help us learn and grow!</p>
                    <p>The correct answer is: </p>
                    <p>{question.options[correctOption]}</p>
                  </>
                )}
              </div>
            )}

            {playerStatus && quiz && (
              <PlayerStatus playerStatus={playerStatus} numberOfQuestions={quiz.numberOfQuestions} />
            )}
          </>
        )}
      </>
    </PageContainer>
  );
};

export default Question;
