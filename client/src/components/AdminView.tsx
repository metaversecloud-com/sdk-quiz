import { useContext, useState } from "react";

// components
import { EditQuestionModal, PageFooter, ResetQuizModal } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

// pages
import { Configure } from "@/pages/Configure";

export const AdminView = () => {
  const { isConfigured, quiz } = useContext(GlobalStateContext);
  const { questions } = quiz!;
  // Legacy = configured quiz with real questions but no settings key
  const isLegacy = isConfigured && !quiz?.settings;

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

  // New quizzes: show the full Configure page
  if (!isLegacy) {
    return <Configure />;
  }

  // Legacy quizzes: show the old settings UI
  return (
    <div style={{ position: "relative" }}>
      <h2>Settings</h2>
      <div className="card my-4">
        <div className="card-details">
          <p className="p2 text-warning">
            This is a legacy quiz. You can edit existing questions below. To access new features (question types, asset
            customization, replay settings), create a new quiz from the library.
          </p>
        </div>
      </div>

      {Object.keys(questions).map((questionId) => (
        <div className="mb-4" key={questionId}>
          Question {questionId}:
          <button
            className="icon-with-rounded-border mx-2 float-right"
            onClick={() => handleToggleShowEditQuestionModal(questionId)}
            aria-label={`Edit question ${questionId}`}
          >
            <img src={`https://sdk-style.s3.amazonaws.com/icons/edit.svg`} alt="Edit" />
          </button>
          <br />
          {questions[questionId].questionText}
          {questions[questionId].questionType && (
            <span className="p3 text-muted ml-2">({questions[questionId].questionType})</span>
          )}
        </div>
      ))}

      <PageFooter>
        <button className="btn btn-danger" onClick={() => handleToggleShowResetModal()} aria-label="Reset quiz">
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
