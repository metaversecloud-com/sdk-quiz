import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { QuestionType } from "@/context/types.js";

// utils
import { backendAPI, setErrorMessage, setQuiz } from "@/utils/index.js";

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

  const [correctOption, setCorrectOption] = useState("");
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = handleSubmit((data) => {
    if (Object.keys(errors).length > 0) {
      return console.error(errors);
    }

    setAreButtonsDisabled(true);

    const updatedQuestion: QuestionType = {
      questionText: data.questionText,
      answer: correctOption,
      options: {},
    };

    for (const optionId of Object.keys(question.options)) {
      const id = optionId.toString();
      updatedQuestion.options[id] = data[id];
    }

    backendAPI
      .put(`/admin/update-question`, { questionId, updatedQuestion })
      .then((response) => {
        setQuiz(dispatch, response.data);
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
          <input
            className="input mb-4"
            {...register("questionText", { required: true, value: question.questionText })}
          />

          <h4 className="mb-4">Options</h4>

          {Object.keys(question.options).map((optionId: string) => (
            <div className="flex mb-6" key={optionId}>
              <input
                className="input-radio mt-3 mr-2"
                defaultChecked={question.options[optionId] === question.answer}
                name="correctOption"
                onChange={() => setCorrectOption(optionId)}
                style={{ height: 20 }}
                type="radio"
              />

              <input
                className="input"
                {...register(optionId, {
                  required: true,
                  value: question.options[optionId],
                })}
              />
            </div>
          ))}

          {Object.keys(errors).length > 0 && (
            <p className="p3 pt-10 text-center text-error">An error has occurred. Please try again later.</p>
          )}

          <div className="actions">
            <button
              id="close"
              className="btn btn-outline"
              onClick={() => handleToggleShowEditQuestionModal("")}
              disabled={areButtonsDisabled}
            >
              Cancel
            </button>
            <button className="btn" disabled={areButtonsDisabled} type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
