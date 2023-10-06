import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editQuestion } from "../../redux/actions/session";
import backArrow from "../../assets/backArrow.svg";
import "./EditQuestionView.scss";

function EditQuestionView({
  selectEditQuestionNumber,
  setSelectEditQuestionNumber,
}) {
  const dispatch = useDispatch();

  const allQuestions = useSelector((state) => state?.session?.allQuestions);
  const questionAsset = useSelector((state) => state?.session?.questionAsset);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState({
    questionText: false,
    answers: [false, false, false, false],
    selectedAnswer: false,
  });

  const currentQuestion = allQuestions?.[selectEditQuestionNumber];

  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    if (currentQuestion) {
      setQuestionText(currentQuestion.question);
      setAnswers((prevAnswers) =>
        currentQuestion.options.map((option, index) =>
          index < prevAnswers.length ? option : ""
        )
      );
      setSelectedAnswer(currentQuestion.answer);
    }
  }, [currentQuestion]);

  const validateForm = () => {
    let hasError = false;
    const errorState = {
      questionText: false,
      answers: [false, false, false, false],
      selectedAnswer: false,
    };

    if (questionText.trim() === "") {
      errorState.questionText = true;
      hasError = true;
    }

    answers.forEach((answer, index) => {
      if (answer.trim() === "") {
        errorState.answers[index] = true;
        hasError = true;
      }
    });

    if (selectedAnswer === null || !answers.includes(selectedAnswer)) {
      errorState.selectedAnswer = true;
      hasError = true;
    }

    setError(errorState);
    return !hasError;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      console.log("Didn't pass validation");
      return;
    }

    const updatedQuestion = {
      question: questionText,
      answer: selectedAnswer,
      options: answers,
    };

    setIsSaving(true);
    try {
      await dispatch(editQuestion(selectEditQuestionNumber, updatedQuestion));
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-question-view-wrapper">
      <div
        style={{ position: "absolute", left: "16px" }}
        className="icon-with-rounded-border"
        onClick={() => {
          setSelectEditQuestionNumber(false);
        }}
      >
        <img src={backArrow} />
      </div>
      <h2>Edit Question</h2>

      <div>
        <h4>Edit</h4>
      </div>

      <div className="question-edit-container" style={{ marginTop: "24px" }}>
        <label>
          Question <span className="danger-text">*</span>
        </label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ width: "302px" }}
          className={error.questionText ? "input-error" : ""}
        />
      </div>

      {answers?.map((answer, index) => (
        <div style={{ marginTop: "16px" }} key={index}>
          <label>
            Answer {index + 1} <span className="danger-text">*</span>
          </label>
          <div
            className="answer-edit-container"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                setSelectedAnswer(null);
                setAnswers((prev) =>
                  prev?.map((a, i) => (i === index ? e.target.value : a))
                );
              }}
              className={error.answers[index] ? "input-error" : ""}
            />

            <span
              className={`radio-button ${
                selectedAnswer === answer ? "active" : ""
              } ${error.selectedAnswer ? "input-error" : ""}`}
              onClick={() => setSelectedAnswer(answer)}
              style={{}}
            />
          </div>
        </div>
      ))}

      <div
        className="footer-fixed"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <button
          className="btn-outline"
          style={{ marginRight: "8px" }}
          onClick={() => {
            setSelectEditQuestionNumber(false);
          }}
        >
          Cancel
        </button>
        <button
          className="start-btn"
          style={{ marginLeft: "8px" }}
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}{" "}
        </button>
      </div>
    </div>
  );
}

export default EditQuestionView;
