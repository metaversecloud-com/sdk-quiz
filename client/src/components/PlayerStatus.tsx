import { ResultsType } from "@/context/types";
import { Timer } from "./Timer";

export const PlayerStatus = ({
  playerStatus,
  numberOfQuestions,
}: {
  playerStatus: ResultsType;
  numberOfQuestions: number;
}) => {
  const { answers, endTime, startTime, timeElapsed } = playerStatus;

  let correctAnswersCount = 0;
  Object.values(answers)?.forEach((item) => {
    if (item && item?.isCorrect) correctAnswersCount++;
  });

  return (
    <>
      {startTime && (
        <div className="text-center mt-6">
          <hr className="mb-6" />

          {endTime ? (
            <>
              <h3>Hooray, quiz complete!</h3>
              <p className="py-3">See how you stack up against others on the leaderboard!</p>
              <h4>Your result:</h4>
              <div className="mt-3 chip chip-success">
                {correctAnswersCount} / {numberOfQuestions} correct in {timeElapsed}
              </div>
            </>
          ) : (
            <>
              <h4>Quiz in progress!</h4>
              <div className="py-3">
                <Timer startTime={startTime} />
              </div>
              <p>
                Questions completed: {Object.keys(answers).length} / {numberOfQuestions}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};
