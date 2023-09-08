import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import {
  getDroppedAsset,
  getVisitor,
  registerUserAnswer,
  clear,
} from "../redux/actions/session";
import "./Home.scss";

function Quiz() {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(null);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const visitor = useSelector((state) => state?.session?.visitor);
  const data = droppedAsset?.dataObject;

  const quizResults =
    droppedAsset?.dataObject?.quiz?.results?.[visitor?.profileId];

  const userAnswer = quizResults?.userAnswer;

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getDroppedAsset());
      await dispatch(getVisitor());
      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (visitor?.dataObject?.quiz?.start_timestamp) {
        const startTimestamp = moment(visitor.dataObject.quiz.start_timestamp);
        const now = moment();
        const duration = moment.duration(now.diff(startTimestamp));
        const minutes = String(duration.minutes()).padStart(2, "0");
        const seconds = String(duration.seconds()).padStart(2, "0");
        setElapsedTime(`${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visitor]);

  const handleSubmit = () => {
    const isCorrectCondition = data?.answer === selectedOption;
    dispatch(registerUserAnswer(isCorrectCondition, selectedOption));
  };

  const handleClear = () => {
    dispatch(clear());
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (userAnswer) {
    return (
      <div className="quiz-container">
        <h1>{data?.question}</h1>
        <div className="result-container">
          {userAnswer === data?.answer ? (
            <>
              <p>
                {" "}
                <span role="img" aria-label="Correct">
                  ✅
                </span>
                Right answer!
              </p>
            </>
          ) : (
            <>
              <p>
                <span role="img" aria-label="Incorrect">
                  ❌
                </span>
                Wrong answer.
              </p>
            </>
          )}
          <p>You answered: {userAnswer}</p>
        </div>
        <button onClick={handleClear}>clear</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h1>{data?.question}</h1>
      <div className="quiz-content">
        {data?.options.map((option, index) => (
          <div key={index} className="option-container">
            <input
              type="radio"
              id={`option-${index}`}
              name="quiz-option"
              value={option}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="option-input"
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ))}
        <button onClick={handleSubmit}>Check</button>
      </div>
      {elapsedTime && <div className="timer">Time elapsed: {elapsedTime}</div>}
    </div>
  );
}

export default Quiz;
