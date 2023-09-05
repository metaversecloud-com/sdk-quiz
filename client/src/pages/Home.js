import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import { getDroppedAsset, getVisitor } from "../redux/actions/session";
import "./Home.scss";

function Quiz() {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);

  const data = droppedAsset?.dataObject;

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getDroppedAsset());
      await dispatch(getVisitor());
      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  const handleSubmit = () => {
    setIsCorrect(data?.answer === selectedOption);
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
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

        {isCorrect !== null && (
          <div className={`result-text ${isCorrect ? "correct" : "incorrect"}`}>
            {isCorrect ? "Right answer!" : "Wrong answer, try again."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
