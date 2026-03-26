import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { QuestionType } from "@/context/types.js";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils/index.js";

export const EditQuestionModal = ({
  handleToggleShowEditQuestionModal,
  question,
  questionId,
}: {
  handleToggleShowEditQuestionModal: (questionId: string) => void;
  question: QuestionType;
  questionId: string;
}) => {
  const dispatch = useContext(GlobalDispatchContext);

  const isAllThatApply = question.questionType === "allThatApply";
  const [correctOption, setCorrectOption] = useState(question.answer || "");
  const [correctOptions, setCorrectOptions] = useState<string[]>(question.correctOptions || []);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const toggleCorrectOption = (optionId: string) => {
    setCorrectOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
    );
  };

  const onSubmit = handleSubmit((data) => {
    if (Object.keys(errors).length > 0) {
      return console.error(errors);
    }

    setAreButtonsDisabled(true);

    const updatedQuestion: QuestionType = {
      questionText: data.questionText,
      questionType: question.questionType || "multipleChoice",
      answer: isAllThatApply ? "" : correctOption,
      correctOptions: isAllThatApply ? correctOptions : undefined,
      options: {},
      mediaUrl: question.mediaUrl,
      mediaType: question.mediaType,
    };

    for (const optionId of Object.keys(question.options)) {
      const id = optionId.toString();
      updatedQuestion.options[id] = data[id];
    }

    backendAPI
      .put(`/admin/update-question`, { questionId, updatedQuestion })
      .then((response) => {
        setGameState(dispatch, response.data);
        handleToggleShowEditQuestionModal("");
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  });

  return (
    <div className="modal-container">
      <div className="modal" style={{ textAlign: "left" }}>
        <form onSubmit={onSubmit}>
          <h4 className="mb-4">Question {questionId}</h4>
          {question.questionType && (
            <p className="p3 text-muted mb-2">Type: {question.questionType === "allThatApply" ? "All That Apply" : "Multiple Choice"}</p>
          )}
          <input
            className="input mb-4"
            {...register("questionText", { required: true, value: question.questionText })}
            aria-label="Question text"
          />

          <h4 className="mb-4">
            Options {isAllThatApply ? "(check all correct)" : "(select correct answer)"}
          </h4>

          {Object.keys(question.options).map((optionId: string) => (
            <div className="flex mb-6" key={optionId}>
              {isAllThatApply ? (
                <input
                  className="input-checkbox mt-3 mr-2"
                  checked={correctOptions.includes(optionId)}
                  onChange={() => toggleCorrectOption(optionId)}
                  style={{ height: 20 }}
                  type="checkbox"
                  aria-label={`Mark option ${optionId} as correct`}
                />
              ) : (
                <input
                  className="input-radio mt-3 mr-2"
                  defaultChecked={question.answer === optionId}
                  name="correctOption"
                  onChange={() => setCorrectOption(optionId)}
                  style={{ height: 20 }}
                  type="radio"
                  aria-label={`Mark option ${optionId} as correct`}
                />
              )}

              <input
                className="input"
                {...register(optionId, {
                  required: true,
                  value: question.options[optionId],
                })}
                aria-label={`Option ${optionId} text`}
              />
            </div>
          ))}

          {Object.keys(errors).length > 0 && (
            <p className="p3 pt-10 text-center text-error" role="alert">An error has occurred. Please try again later.</p>
          )}

          <div className="actions">
            <button
              id="close"
              className="btn btn-outline"
              onClick={() => handleToggleShowEditQuestionModal("")}
              disabled={areButtonsDisabled}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button className="btn" disabled={areButtonsDisabled} type="submit" aria-label="Save question changes">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
