import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  registerUserAnswer,
  loadG,
  loadGameState,
} from "../redux/actions/session";
import "./QuestionAssetView.scss";
import info from "../assets/info.png";
import Timer from "../components/timer/Timer.js";
import AdminView from "./Admin/AdminView";
import gear from "../assets/gear.svg";
import Leaderboard from "./LeaderboardAssetView";

function Quiz() {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);

  const visitor = useSelector((state) => state?.session?.visitor);
  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);
  const inZone = useSelector((state) => state?.session?.inZone);

  const data = droppedAsset?.dataObject;

  console.log("droppedAsset", droppedAsset);

  const questionNumber = extractQuestionNumber(droppedAsset?.uniqueName);

  function extractQuestionNumber(str) {
    const parts = str?.split("-");
    if (parts?.length > 2 && !isNaN(parts[2])) {
      return parseInt(parts[2], 10);
    }
    return null;
  }

  const quizResults =
    startDroppedAsset?.dataObject?.quiz?.results?.[visitor?.profileId]?.[
      `question-${questionNumber}`
    ];

  const userAnswer = quizResults?.userAnswer;

  useEffect(() => {
    const fetchDroppedAsset = () => {
      dispatch(loadGameState());
      setLoading(false);
    };
    fetchDroppedAsset();
  }, [dispatch]);

  useEffect(() => {
    setSelectedOption(userAnswer);
  }, [userAnswer]);

  const handleOptionClick = (option) => {
    if (!selectedOption) {
      setSelectedOption(option);
      const isCorrectCondition = data?.answer === option;
      dispatch(registerUserAnswer(isCorrectCondition, option));
    }
  };

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

  function showModal() {
    return (
      <>
        <div className={`modal-container ${!inZone ? "visible" : ""}`}>
          <div className="modal">
            <h4>Outside the question zone</h4>
            <p>Please step inside the question zone to answer the question.</p>
          </div>
        </div>
      </>
    );
  }

  if (showLeaderboard) {
    return <Leaderboard originAsset="questionAsset" />;
  }

  if (loading || startTimestamp === null) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (!startTimestamp || startTimestamp === undefined) {
    return (
      <>
        {visitor.isAdmin ? getGear() : <></>}
        <div className="center-content" style={{ padding: "0px 16px" }}>
          <img
            src={info}
            style={{ width: "48px", height: "48px", marginBottom: "15px" }}
          ></img>
          <h3 style={{ marginBotton: "0px" }}>Quiz race not started</h3>
          <p className="description">
            Please go to the start zone and start the quiz race.
          </p>
        </div>
      </>
    );
  }

  function questionStartScreen() {
    return (
      <>
        {visitor.isAdmin ? getGear() : <></>}
        <div className="question-container">
          <div
            style={{ marginTop: "24px" }}
            className={visitor?.isAdmin ? "pt-46" : ""}
          >
            <div style={{ textAlign: "center" }}>
              <Timer />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>❓</h1>
          </div>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{ color: "#0A2540", fontSize: "24px", margin: "14px 0px" }}
              className="question-text"
            >
              {data?.question}
            </h1>
          </div>
          <div className="quiz-content">
            {data?.options?.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedOption === option
                    ? data?.answer === option
                      ? "correct"
                      : "incorrect"
                    : ""
                } ${selectedOption ? "disabled" : ""}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedOption && (
            <div
              className={
                selectedOption === data?.answer
                  ? "feedback correct-feedback"
                  : "feedback incorrect-feedback"
              }
            >
              {selectedOption === data?.answer ? (
                <p>You're a genius! 🧠</p>
              ) : (
                <>
                  <p>Nice try! Mistakes help us learn and grow! 🌱</p>
                  <p>The correct answer is: {data?.answer}</p>
                </>
              )}
            </div>
          )}
          {endTimestamp ? (
            <p>Congratulations, you answered all questions!!</p>
          ) : (
            ""
          )}
          {showModal()}
        </div>
      </>
    );
  }

  return questionStartScreen();
}

export default Quiz;
