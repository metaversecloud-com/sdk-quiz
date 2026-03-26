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
  const settings = quiz?.settings;
  const showCorrectAnswer = settings?.showCorrectAnswer ?? true;

  const [searchParams] = useSearchParams();
  const questionId = searchParams.get("questionId") || searchParams.get("questionid") || searchParams.get("uniqueName");

  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionType>();
  const [correctOption, setCorrectOption] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeout = () => {
    backendAPI
      .post("/quiz/timeout")
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error));
  };

  const isAllThatApply = question?.questionType === "allThatApply";
  const previousAnswer = answers?.[questionId || ""];
  const isAnswered = !!previousAnswer;

  const selectOption = (option: string) => {
    if (isAllThatApply) {
      // Toggle selection for all-that-apply
      setSelectedOptions((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
    } else {
      setSelectedOption(option);
    }
  };

  const submitAnswer = (option?: string, options?: string[]) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isCorrectForMultipleChoice = (option || selectedOption) === correctOption;
    const correctOptionsSet = new Set(question?.correctOptions || []);
    const selectedSet = new Set(options || selectedOptions);
    const isCorrectForAllThatApply =
      correctOptionsSet.size === selectedSet.size && [...correctOptionsSet].every((o) => selectedSet.has(o));

    const isCorrect = isAllThatApply ? isCorrectForAllThatApply : isCorrectForMultipleChoice;

    backendAPI
      .post(`/question/answer/${questionId}`, {
        isCorrect,
        selectedOption: option || selectedOption || "",
        selectedOptions: isAllThatApply ? options || selectedOptions : undefined,
      })
      .then((response) => {
        setGameState(dispatch, response.data);
        setHasSubmitted(true);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsSubmitting(false));
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
      const q = quiz.questions[questionId];
      setQuestion(q);

      if (q?.answer) {
        setCorrectOption(q.answer);
      }

      if (answers?.[questionId]) {
        setSelectedOption(answers[questionId].answer);
        setSelectedOptions(answers[questionId].selectedOptions || []);
        setHasSubmitted(true);
      }

      setIsLoading(false);
    }
  }, [quiz, questionId]);

  const renderMedia = () => {
    if (!question?.mediaUrl) return null;
    const url = question.mediaUrl;
    const type = question.mediaType || "image";

    return (
      <div className="mb-4">
        {type === "image" && <img src={url} alt="Question media" style={{ width: "100%", borderRadius: "8px" }} />}
        {type === "video" && (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={url}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "8px" }}
              allowFullScreen
              title="Question video"
            />
          </div>
        )}
        {type === "link" && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-text">
            View attached resource
          </a>
        )}
      </div>
    );
  };

  const isDisabled = isAnswered;

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

            {renderMedia()}

            {isAllThatApply ? (
              // All-that-apply: checkboxes
              <>
                <p className="p3 text-muted mb-2">Select all that apply</p>
                {Object.keys(question.options).map((optionId) => {
                  const isSelected = selectedOptions.includes(optionId);
                  const isCorrectOpt =
                    hasSubmitted && showCorrectAnswer && (question.correctOptions || []).includes(optionId);
                  const isWrongSelection =
                    hasSubmitted &&
                    showCorrectAnswer &&
                    isSelected &&
                    !(question.correctOptions || []).includes(optionId);
                  const isMissedCorrect =
                    hasSubmitted &&
                    showCorrectAnswer &&
                    !isSelected &&
                    (question.correctOptions || []).includes(optionId);

                  const inputClass = `input-checkbox mr-2${isCorrectOpt ? " input-success" : isWrongSelection || isMissedCorrect ? " input-error" : ""}`;

                  return (
                    <div className="flex mt-4 items-center" key={optionId}>
                      <input
                        className={inputClass}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => selectOption(optionId)}
                        style={{ minWidth: "20px", height: "20px" }}
                        type="checkbox"
                        aria-label={`Option: ${question.options[optionId]}`}
                      />
                      <span
                        className={
                          isCorrectOpt ? "text-success" : isWrongSelection || isMissedCorrect ? "text-danger" : ""
                        }
                      >
                        {question.options[optionId]}
                      </span>
                    </div>
                  );
                })}

                {!isDisabled && selectedOptions.length > 0 && !hasSubmitted && (
                  <button
                    className="btn mt-6"
                    onClick={() => submitAnswer(undefined, selectedOptions)}
                    disabled={isSubmitting}
                    aria-label="Submit answer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </button>
                )}
              </>
            ) : (
              // Multiple choice: radio buttons
              <>
                {Object.keys(question.options).map((optionId) => {
                  const isCorrectOpt = hasSubmitted && showCorrectAnswer && optionId === correctOption;
                  const isWrongSelection =
                    hasSubmitted && showCorrectAnswer && optionId === selectedOption && optionId !== correctOption;

                  const inputClass = `input-radio mr-2${isCorrectOpt ? " input-success" : isWrongSelection ? " input-error" : ""}`;

                  return (
                    <div className="flex mt-6" key={optionId}>
                      <input
                        className={inputClass}
                        defaultChecked={optionId === selectedOption}
                        disabled={isDisabled}
                        name="selectedOption"
                        onChange={() => selectOption(optionId)}
                        style={{ height: 20 }}
                        type="radio"
                        aria-label={`Option: ${question.options[optionId]}`}
                      />
                      <span className={isCorrectOpt ? "text-success" : isWrongSelection ? "text-danger" : ""}>
                        {question.options[optionId]}
                      </span>
                    </div>
                  );
                })}

                {selectedOption && !hasSubmitted && (
                  <button
                    className="btn mt-6"
                    onClick={() => submitAnswer()}
                    disabled={isSubmitting}
                    aria-label="Submit answer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </button>
                )}
              </>
            )}

            {showCorrectAnswer && hasSubmitted && !isAllThatApply && (
              <div className="text-center mt-10 mb-6">
                <hr />
                {selectedOption === correctOption ? (
                  <p className="pt-6 text-success" role="status">
                    You're a genius!
                  </p>
                ) : (
                  <>
                    <p className="pt-6 pb-3" role="status">
                      Nice try! Mistakes help us learn and grow!
                    </p>
                    <p>The correct answer is: </p>
                    <p className="text-success">{question.options[correctOption]}</p>
                  </>
                )}
              </div>
            )}

            {showCorrectAnswer && hasSubmitted && isAllThatApply && (
              <div className="text-center mt-10 mb-6">
                <hr />
                {previousAnswer?.isCorrect ? (
                  <p className="pt-6 text-success" role="status">
                    You got them all right!
                  </p>
                ) : (
                  <p className="pt-6" role="status">
                    Not quite! Check the highlighted answers above.
                  </p>
                )}
              </div>
            )}

            {!playerStatus?.endTime && !showCorrectAnswer && hasSubmitted && (
              <div className="text-center mt-10 mb-6">
                <hr />
                <p className="pt-6" role="status">
                  Answer recorded! Move on to the next question.
                </p>
              </div>
            )}

            {playerStatus && quiz && (
              <PlayerStatus
                playerStatus={playerStatus}
                numberOfQuestions={quiz.numberOfQuestions}
                timerDurationMinutes={settings?.timerDurationMinutes}
                onTimeout={handleTimeout}
              />
            )}
          </>
        )}
      </>
    </PageContainer>
  );
};

export default Question;
