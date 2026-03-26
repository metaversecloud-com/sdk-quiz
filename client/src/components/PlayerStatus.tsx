import { ReplayMode, ResultsType } from "@/context/types";
import { Timer } from "./Timer";

export const PlayerStatus = ({
  playerStatus,
  numberOfQuestions,
  replayMode = "manual",
  timerDurationMinutes,
  onRestart,
  onTimeout,
}: {
  playerStatus: ResultsType;
  numberOfQuestions: number;
  replayMode?: ReplayMode;
  timerDurationMinutes?: number;
  onRestart?: () => void;
  onTimeout?: () => void;
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

              {replayMode === "manual" && onRestart && (
                <div className="mt-6">
                  <hr className="mb-6" />
                  <p className="p2 pb-3">Want to perfect your score or get better time?</p>
                  <button className="btn" onClick={onRestart} aria-label="Race again">
                    Restart Quiz
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h4>Quiz in progress!</h4>
              <div className="py-3">
                <Timer startTime={startTime} timerDurationMinutes={timerDurationMinutes} onTimeout={onTimeout} />
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
