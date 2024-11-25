import { useContext, useState } from "react";

// components
import { EditQuestionModal, PageFooter, ResetQuizModal } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const AdminView = () => {
  const { quiz } = useContext(GlobalStateContext);
  const { questions } = quiz!;

  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  function handleToggleShowEditQuestionModal(questionId: string) {
    setSelectedQuestionId(questionId);
    setShowEditQuestionModal(!showEditQuestionModal);
  }

  function handleToggleShowResetModal() {
    setShowResetModal(!showResetModal);
  }

  return (
    <div style={{ position: "relative" }}>
      {Object.keys(questions).map((questionId) => (
        <div className="mb-4" key={questionId}>
          Question {questionId}:
          <button
            className="icon-with-rounded-border mx-2 float-right"
            onClick={() => handleToggleShowEditQuestionModal(questionId)}
          >
            <img src={`https://sdk-style.s3.amazonaws.com/icons/edit.svg`} />
          </button>
          <br />
          {questions[questionId].questionText}
        </div>
      ))}

      <PageFooter>
        <button className="btn btn-danger" onClick={() => handleToggleShowResetModal()}>
          Reset Quiz
        </button>
      </PageFooter>

      {showEditQuestionModal && (
        <EditQuestionModal
          handleToggleShowEditQuestionModal={handleToggleShowEditQuestionModal}
          questionId={selectedQuestionId}
          question={questions[selectedQuestionId]}
        />
      )}

      {showResetModal && <ResetQuizModal handleToggleShowResetModal={handleToggleShowResetModal} />}
    </div>
  );
};

export default AdminView;
