import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  startClock,
  getDroppedAsset,
  getStartDroppedAsset,
  updateStartTimestamp,
} from "../redux/actions/session";
import "./StartAssetView.scss";
import Timer from "../components/timer/Timer.js";
import TotalQuestionsAnsweredView from "../components/totalQuestionsAnsweredView/TotalQuestionsAnsweredView.js";

function StartAssetView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);

  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getStartDroppedAsset());

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

  function quizStatus() {
    if (!startTimestamp) {
      return "NOT_STARTED";
    } else if (startTimestamp && !endTimestamp) {
      return "ONGOING";
    } else if (startTimestamp && endTimestamp) {
      return "ENDED";
    }
    return false;
  }

  // is quiz ongoing?
  if (quizStatus() === "ONGOING") {
    return (
      <div>
        <div style={{ textAlign: "center", margin: "24px 0px" }}>
          <div style={{ textAlign: "center" }}>
            <Timer />
          </div>
          <div style={{ marginTop: "16px" }}>
            <TotalQuestionsAnsweredView />
          </div>
        </div>
        {startScreen()}
      </div>
    );
  } else if (quizStatus() === "ENDED") {
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
        <div style={{ textAlign: "left", margin: "24px 0px" }}>
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
          {quizStatus() === "ONGOING" ? (
            <div className="balloon-dialog">
              This quiz is currently in progress
            </div>
          ) : isStartButtonClicked ? (
            <div className="balloon-dialog">Starting Quiz...</div>
          ) : null}

          <button
            onClick={() => {
              setIsStartButtonClicked(true);
              dispatch(updateStartTimestamp());
            }}
            className="start-btn"
            style={{ width: "90%" }}
            disabled={
              quizStatus() === "ONGOING" ||
              quizStatus() === "ENDED" ||
              isStartButtonClicked
            }
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
