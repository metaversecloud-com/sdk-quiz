// src/components/Quiz.js
import React, { useState } from "react";
import "./Home.scss";

const data = {
  question: "1 + 1?",
  options: ["1", "2", "3", "4"],
  answer: "2",
};

function Quiz() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSubmit = () => {
    setIsCorrect(data.answer === selectedOption);
  };

  return (
    <div className="quiz-container">
      <h1>{data.question}</h1>
      <div className="quiz-content">
        {data.options.map((option, index) => (
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
