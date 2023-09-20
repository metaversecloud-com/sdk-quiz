import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  getDroppedAsset,
  getVisitor,
  registerUserAnswer,
  getTimestamp,
} from "../redux/actions/session";
import "./QuestionAssetView.scss";
import info from "../assets/info.png";
import Timer from "../components/timer/Timer.js";

function Quiz() {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(false);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const visitor = useSelector((state) => state?.session?.visitor);
  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const data = droppedAsset?.dataObject;

  const quizResults =
    droppedAsset?.dataObject?.quiz?.results?.[visitor?.profileId];

  const userAnswer = quizResults?.userAnswer;

  useEffect(() => {
    const fetchDroppedAsset = () => {
      dispatch(getDroppedAsset());
      dispatch(getVisitor());
      dispatch(getTimestamp());

      setLoading(false);
    };
    fetchDroppedAsset();
  }, [dispatch]);

  useEffect(() => {
    if (startTimestamp) {
      const interval = setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - startTimestamp);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTimestamp]);

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

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (!startTimestamp) {
    return (
      <div className="center-content">
        <img
          src={info}
          style={{ width: "48px", height: "48px", marginBottom: "15px" }}
        ></img>
        <h3 style={{ marginBotton: "0px" }}>Quiz race not started</h3>
        <p className="description">
          Please go to the start zone and start the quiz race.
        </p>
      </div>
    );
  }

  function questionStartScreen() {
    return (
      <div className="quiz-container">
        <div style={{ marginTop: "20px" }}>
          <Timer />
        </div>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>❓</h1>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "#0A2540" }}>{data?.question}</h1>
        </div>
        <div className="quiz-content">
          {data?.options.map((option, index) => (
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
      </div>
    );
  }

  return questionStartScreen();
}

export default Quiz;
