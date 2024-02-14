import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  getStartDroppedAsset,
  updateStartTimestamp,
} from "../redux/actions/session";
import "./StartAssetView.scss";
import Timer from "../components/timer/Timer.js";
import TotalQuestionsAnsweredView from "../components/totalQuestionsAnsweredView/TotalQuestionsAnsweredView.js";
import gear from "../assets/gear.svg";
import AdminView from "./Admin/AdminView.js";
import QuizEnded from "../components/quizEnded/QuizEnded";
import Leaderboard from "./LeaderboardAssetView";
import instructionsImg from "../assets/instructions-start.png";

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
        <div
          style={{
            textAlign: "center",
            margin: "24px 0px",
            paddingTop: visitor?.isAdmin ? "50px" : "0px",
          }}
        >
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
      <QuizEnded
        setShowSettings={setShowSettings}
        setShowLeaderboard={setShowLeaderboard}
        originAsset="startAsset"
      />
    );
  }

  function startScreen() {
    return (
      <>
        {visitor?.isAdmin ? getGear() : <></>}
        {showModal()}
        <div style={{ marginBottom: "150px" }}>
          <div
            style={{
              textAlign: "left",
              margin: "24px 0px",
            }}
            className={
              visitor?.isAdmin && quizStatus() != "ONGOING" ? "pt-50" : ""
            }
          >
            <div
              style={{ marginBottom: "24px", padding: "0px 12px" }}
              className={visitor?.isAdmin ? "mt-24" : ""}
            >
              <img src={instructionsImg} style={{ width: "100%" }} />
            </div>
            <h4 style={{ textAlign: "center" }}>🏎️ Welcome to Quiz Race!</h4>
          </div>
          <div className="instructions" style={{ padding: "0px 16px" }}>
            <div className="title" style={{ fontWeight: "600" }}>
              How to play:
            </div>
            <ol style={{ marginTop: "5px" }}>
              <li>
                Click <b style={{ color: "green" }}>Start Quiz</b>.
              </li>
              <li>Run to each question zone, and click the question mark.</li>
              <li>Answer all questions (there are 4).</li>
            </ol>

            <div className="rules">
              <div className="title" style={{ fontWeight: "600" }}>
                Important Rules:
              </div>
              <ul style={{ marginTop: "5px" }}>
                <li>
                  You must be in the question zone to answer the question.
                </li>
                <li>
                  <b>Time</b> starts when you click{" "}
                  <b style={{ color: "green" }}>Start Quiz</b>.
                </li>
                <li>Check your rank by clicking the 🏆 leaderboard.</li>
              </ul>
            </div>
          </div>

          <div
            className="footer-fixed"
            style={{ width: "95%", backgroundColor: "white" }}
          >
            {quizStatus() === "ONGOING" ? (
              <div
                style={{
                  color: "#00875A",
                  fontWeight: "600",
                  padding: "16px 0px",
                }}
              >
                Quiz has started!
              </div>
            ) : (
              ""
            )}
            <button
              onClick={() => {
                setIsStartButtonClicked(true);
                dispatch(updateStartTimestamp());
              }}
              className="btn-success"
              style={{ width: "90%" }}
              disabled={
                quizStatus() === "ONGOING" ||
                quizStatus() === "ENDED" ||
                isStartButtonClicked
              }
            >
              Start Quiz
              {quizStatus() === "ONGOING" ? (
                <div className="balloon-dialog">
                  This quiz is currently in progress
                </div>
              ) : isStartButtonClicked ? (
                <div className="balloon-dialog">Starting Quiz...</div>
              ) : null}
            </button>
          </div>
        </div>
      </>
    );
  }

  return <div>{startScreen()}</div>;
}

export default StartAssetView;
