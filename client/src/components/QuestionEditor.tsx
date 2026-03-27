import { useState } from "react";
import { QuestionType, QuizQuestionType } from "@/context/types";

interface QuestionEditorProps {
  questionId: string;
  question: QuestionType;
  onChange: (questionId: string, question: QuestionType) => void;
  onDelete?: (questionId: string) => void;
  canDelete?: boolean;
  isDeleting?: boolean;
  errors?: { [field: string]: string };
}

export const QuestionEditor = ({ questionId, question, onChange, onDelete, canDelete, isDeleting, errors }: QuestionEditorProps) => {
  const [optionCount, setOptionCount] = useState(Math.max(Object.keys(question.options).length, 2));

  const handleFieldChange = (field: string, value: string | undefined) => {
    onChange(questionId, { ...question, [field]: value });
  };

  const handleOptionChange = (optionId: string, value: string) => {
    const updatedOptions = { ...question.options, [optionId]: value };
    onChange(questionId, { ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const newId = (optionCount + 1).toString();
    setOptionCount(optionCount + 1);
    const updatedOptions = { ...question.options, [newId]: "" };
    onChange(questionId, { ...question, options: updatedOptions });
  };

  const handleRemoveOption = (optionId: string) => {
    if (Object.keys(question.options).length <= 2) return;
    const updatedOptions = { ...question.options };
    delete updatedOptions[optionId];

    // Clean up answer references
    const updatedQuestion = { ...question, options: updatedOptions };
    if (question.questionType === "allThatApply") {
      updatedQuestion.correctOptions = (question.correctOptions || []).filter((id) => id !== optionId);
    } else if (question.answer === optionId) {
      updatedQuestion.answer = "";
    }

    onChange(questionId, updatedQuestion);
  };

  const handleCorrectOptionToggle = (optionId: string) => {
    if (question.questionType === "allThatApply") {
      const current = question.correctOptions || [];
      const updated = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      onChange(questionId, { ...question, correctOptions: updated });
    } else {
      onChange(questionId, { ...question, answer: optionId });
    }
  };

  const questionType = question.questionType || "multipleChoice";

  return (
    <div className="card mb-4" role="region" aria-label={`Question ${questionId}`}>
      <div className="card-details grid gap-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="card-title">Question {questionId}</h4>
          {canDelete && onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-icon"
              onClick={() => onDelete(questionId)}
              disabled={isDeleting}
              aria-label={`Delete question ${questionId}`}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              <img src="https://sdk-style.s3.amazonaws.com/icons/delete.svg" alt="Delete" />
            </button>
          )}
        </div>

        <p>Question Type</p>
        <label className="label" style={{ fontWeight: "normal" }}>
          <input
            className="input-radio mr-2"
            type="radio"
            name={`questionType-${questionId}`}
            checked={questionType === "multipleChoice"}
            onChange={() => handleFieldChange("questionType", "multipleChoice" as QuizQuestionType)}
          />
          Multiple Choice
        </label>
        <label className="label" style={{ fontWeight: "normal" }}>
          <input
            className="input-radio mr-2"
            type="radio"
            name={`questionType-${questionId}`}
            checked={questionType === "allThatApply"}
            onChange={() => handleFieldChange("questionType", "allThatApply" as QuizQuestionType)}
          />
          All That Apply
        </label>
        <label className="label" style={{ fontWeight: "normal" }}>
          <input
            className="input-radio mr-2"
            type="radio"
            name={`questionType-${questionId}`}
            checked={questionType === "openText"}
            onChange={() => handleFieldChange("questionType", "openText" as QuizQuestionType)}
          />
          Open Text
        </label>

        <p className="pt-4">Question Text</p>
        <input
          className={`input${errors?.questionText ? " input-error" : ""}`}
          type="text"
          value={question.questionText}
          onChange={(e) => handleFieldChange("questionText", e.target.value)}
          placeholder="Enter your question"
          required
          aria-label={`Question ${questionId} text`}
        />
        {errors?.questionText && <p className="p3 text-error">{errors.questionText}</p>}

        {questionType === "openText" ? (
          <>
            <p className="pt-4">Correct Answer (case-insensitive)</p>
            <input
              className={`input${errors?.answer ? " input-error" : ""}`}
              type="text"
              value={question.answer || ""}
              onChange={(e) => handleFieldChange("answer", e.target.value)}
              placeholder="Enter the correct answer"
              required
              aria-label="Correct answer text"
            />
            {errors?.answer && <p className="p3 text-error">{errors.answer}</p>}
          </>
        ) : (
          <>
            <p className="pt-4">
              Options {questionType === "allThatApply" ? "(check all correct answers)" : "(select the correct answer)"}
            </p>
            {Object.keys(question.options).map((optionId) => (
              <div className="flex items-center" key={optionId}>
                {questionType === "allThatApply" ? (
                  <input
                    className="input-checkbox mr-2"
                    type="checkbox"
                    checked={(question.correctOptions || []).includes(optionId)}
                    onChange={() => handleCorrectOptionToggle(optionId)}
                    aria-label={`Mark option ${optionId} as correct`}
                    style={{ minWidth: "20px", height: "20px" }}
                  />
                ) : (
                  <input
                    className="input-radio mr-2"
                    type="radio"
                    name={`answer-${questionId}`}
                    checked={question.answer === optionId}
                    onChange={() => handleCorrectOptionToggle(optionId)}
                    aria-label={`Mark option ${optionId} as correct`}
                    style={{ minWidth: "20px", height: "20px" }}
                  />
                )}
                <div className="flex-1">
                  <input
                    className={`input${errors?.[`option-${optionId}`] ? " input-error" : ""}`}
                    type="text"
                    value={question.options[optionId]}
                    onChange={(e) => handleOptionChange(optionId, e.target.value)}
                    placeholder={`Option ${optionId}`}
                    required
                    aria-label={`Option ${optionId} text`}
                  />
                  {errors?.[`option-${optionId}`] && <p className="p3 text-error">{errors[`option-${optionId}`]}</p>}
                </div>
                {Object.keys(question.options).length > 2 && (
                  <button
                    type="button"
                    className="btn btn-text max-w-[16px]"
                    onClick={() => handleRemoveOption(optionId)}
                    aria-label={`Remove option ${optionId}`}
                    style={{ padding: "4px", minWidth: "auto" }}
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            {errors?.correctAnswer && <p className="p3 text-error">{errors.correctAnswer}</p>}
            <button type="button" className="btn btn-text mt-2" onClick={handleAddOption} aria-label="Add another option">
              + Add Option
            </button>
          </>
        )}

        <div className="mt-4">
          <p>Media URL (optional)</p>
          <input
            className="input"
            type="url"
            value={question.mediaUrl || ""}
            onChange={(e) => handleFieldChange("mediaUrl", e.target.value || undefined)}
            placeholder="Image, video, or website URL"
            aria-label="Media URL attachment"
          />
          {question.mediaUrl && (
            <div className="flex gap-2 mt-2">
              <label className="label" style={{ fontWeight: "normal" }}>
                <input
                  className="input-radio mr-2"
                  type="radio"
                  name={`mediaType-${questionId}`}
                  checked={(question.mediaType || "image") === "image"}
                  onChange={() => handleFieldChange("mediaType", "image")}
                />
                Image
              </label>
              <label className="label" style={{ fontWeight: "normal" }}>
                <input
                  className="input-radio mr-2"
                  type="radio"
                  name={`mediaType-${questionId}`}
                  checked={question.mediaType === "video"}
                  onChange={() => handleFieldChange("mediaType", "video")}
                />
                Video
              </label>
              <label className="label" style={{ fontWeight: "normal" }}>
                <input
                  className="input-radio mr-2"
                  type="radio"
                  name={`mediaType-${questionId}`}
                  checked={question.mediaType === "link"}
                  onChange={() => handleFieldChange("mediaType", "link")}
                />
                Link
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
