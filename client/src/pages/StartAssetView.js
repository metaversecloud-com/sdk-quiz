import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  startClock,
  getDroppedAsset,
  getStartDroppedAsset,
  updateStartTimestamp,
  getLeaderboard,
} from "../redux/actions/session";
import "./StartAssetView.scss";
import Timer from "../components/timer/Timer.js";
import TotalQuestionsAnsweredView from "../components/totalQuestionsAnsweredView/TotalQuestionsAnsweredView.js";
import gear from "../assets/gear.svg";
import AdminView from "./Admin/AdminView";
import YourResult from "../components/yourResult/YourResult";
import Leaderboard from "./LeaderboardAssetView";

function StartAssetView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);
  const visitor = useSelector((state) => state?.session?.visitor);
  const inPrivateZone = useSelector((state) => state?.session?.inPrivateZone);

  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );
  const profileId = useSelector(
    (state) => state?.session?.visitor?.profile.profileId
  );

  const numberOfQuestionsAnswered =
    startDroppedAsset?.dataObject?.quiz?.[profileId]
      ?.numberOfQuestionsAnswered || 0;

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

  function getGear() {
    return (
      <div
        style={{ position: "absolute", left: "16px", top: "24px" }}
        className="icon-with-rounded-border"
        onClick={() => {
          setShowSettings(true);
        }}
      >
        <img src={gear} />
      </div>
    );
  }

  if (showSettings) {
    return <AdminView setShowSettings={setShowSettings} />;
  }

  if (showLeaderboard) {
    return <Leaderboard originAsset="startAsset" />;
  }

  function showModal() {
    return (
      <>
        <div class={`modal-container ${!inPrivateZone ? "visible" : ""}`}>
          <div class="modal">
            <h4>Outside start zone</h4>
            <p2>Please walk inside the start zone to start the quiz race.</p2>
          </div>
        </div>
      </>
    );
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
      <div style={{ margin: "0px 14px" }}>
        {visitor.isAdmin ? getGear() : <></>}
        <div className="quiz-completed-container center-content">
          <p style={{ fontSize: "40px", margin: "0px" }}>🏆</p>
          <h3>Hooray, quiz complete!</h3>
          <p>See how you stack up against others on the leaderboard!</p>
          <div
            style={{
              width: "100%",
              borderBottom: "1px solid #EBEDEF",
              marginTop: "20px",
            }}
          >
            {" "}
          </div>
          <div style={{ marginTop: "20px", height: "48px" }}>
            <p>
              <b>Your result:</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <YourResult />
          </div>
          <div style={{ width: "100%" }}>
            <button
              className="btn-outline"
              onClick={() => {
                dispatch(getLeaderboard("startAsset"));
                setShowLeaderboard(true);
              }}
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  function startScreen() {
    return (
      <>
        {visitor.isAdmin ? getGear() : <></>}
        {showModal()}
        <div>
          <div
            style={{ textAlign: "left", margin: "24px 0px" }}
            className={visitor?.isAdmin ? "pt-5" : ""}
          >
            <h4 style={{ textAlign: "center" }}>🏎️ Welcome to Quiz Race!</h4>
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
                Run to each ⭕️ question zone, and click the ❓ question mark.
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
      </>
    );
  }

  return startScreen();
}

export default StartAssetView;
