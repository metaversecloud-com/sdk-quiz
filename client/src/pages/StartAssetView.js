import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  getVisitor,
  startClock,
  getQuestionsStatistics,
  getTimestamp,
} from "../redux/actions/session";
import "./StartAssetView.scss";
import Timer from "../components/timer/Timer.js";

function StartAssetView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);

  const totalNumberOfQuestionsInQuiz = useSelector(
    (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  );
  const numberOfQuestionsAnswered = useSelector(
    (state) => state?.session?.questionsAnswered?.numberOfQuestionsAnswered
  );
  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getVisitor());
      await dispatch(getQuestionsStatistics());
      await dispatch(getTimestamp());

      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  const getTotalQuestionsAnsweredView = () => {
    return (
      <div>
        {numberOfQuestionsAnswered}/{totalNumberOfQuestionsInQuiz}
      </div>
    );
  };

  function isQuizOngoing() {
    return (
      numberOfQuestionsAnswered >= 0 &&
      numberOfQuestionsAnswered < totalNumberOfQuestionsInQuiz &&
      startTimestamp
    );
  }

  // is quiz ongoing?
  if (isQuizOngoing()) {
    return (
      <div>
        <div style={{ textAlign: "center", margin: "20px 0px" }}>
          <Timer />
          {getTotalQuestionsAnsweredView()}
        </div>
        {startScreen()}
      </div>
    );
  } else if (numberOfQuestionsAnswered === totalNumberOfQuestionsInQuiz) {
    return (
      <div className="quiz-completed-container center-content">
        <h3>Hooray, quiz complete!</h3>
        <p>See how you stack up against others on the leaderboard!</p>
      </div>
    );
  }

  function startScreen() {
    return (
      <div>
        <div style={{ textAlign: "left", margin: "20px 0px" }}>
          <h4 style={{ textAlign: "left" }}>🏎️ Welcome to Quiz Race!</h4>
        </div>
        <div className="instructions">
          <div className="title" style={{ fontWeight: "600" }}>
            How to play:
          </div>
          <ol style={{ marginTop: "5px" }}>
            <li>
              Click <b style={{ color: "green" }}>Start Quiz</b>.
            </li>
            <li>
              Run to each ⭕️ question zone, and click the❓question mark.
            </li>
            <li>Answer all questions (there are 4).</li>
            <li>Run back to the 🏁 start zone.</li>
          </ol>

          <div className="tips">
            <div className="title" style={{ fontWeight: "600" }}>
              Helpful Tips:
            </div>
            <ul style={{ marginTop: "5px" }}>
              <li>
                You must be in the ⭕️ question zone to answer the question.
              </li>
              <li>
                ⌛️ Time starts when you click{" "}
                <b style={{ color: "green" }}>Start Quiz</b>.
              </li>
              <li>Click the 🏆 leaderboard to check your rank.</li>
            </ul>
          </div>
        </div>
        <div className="footer-fixed">
          {isQuizOngoing() ? (
            <div className="balloon-dialog">
              This quiz is currently in progress
            </div>
          ) : null}
          <button
            onClick={() => {
              setIsStartButtonClicked(true);
              dispatch(startClock());
            }}
            className="start-btn"
            style={{ width: "90%" }}
            disabled={isQuizOngoing() || isStartButtonClicked}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return startScreen();
}

export default StartAssetView;
