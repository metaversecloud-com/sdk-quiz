import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils/index.js";

export const ResetQuizModal = ({ handleToggleShowResetModal }: { handleToggleShowResetModal: () => void }) => {
  const dispatch = useContext(GlobalDispatchContext);

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleResetQuiz = () => {
    setAreButtonsDisabled(true);

    backendAPI
      .post(`/admin/reset`)
      .then((response) => setGameState(dispatch, response.data))
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowResetModal();
      });
  };

  return (
    <div className="modal-container">
      <div className="modal">
        <h4>Reset Quiz?</h4>
        <p>All player data will be erased.</p>
        <div className="actions">
          <button
            id="close"
            className="btn btn-outline"
            onClick={() => handleToggleShowResetModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button className="btn btn-danger-outline" onClick={() => handleResetQuiz()} disabled={areButtonsDisabled}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetQuizModal;
