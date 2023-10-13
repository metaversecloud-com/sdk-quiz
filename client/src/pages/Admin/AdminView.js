import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../../redux/actions/session";
import penToSquareSvg from "../../assets/pen-to-square-regular.svg";
import EditQuestionView from "./EditQuestionView";
import { getAllQuestions } from "../../redux/actions/session";
import backArrow from "../../assets/backArrow.svg";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [resetButtonClicked, setResetButtonClicked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectEditQuestionNumber, setSelectEditQuestionNumber] =
    useState(false);

  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );

  const allQuestions = useSelector((state) => state?.session?.allQuestions);
  const gameResetFlag = useSelector((state) => state?.session?.gameResetFlag);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getAllQuestions());
      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  useEffect(() => {
    if (gameResetFlag) {
      setResetButtonClicked(false);
      setShowModal(false);
    }
  }, [gameResetFlag]);

  function getBackArrow() {
    return (
      <div
        style={{ position: "absolute", left: "16px" }}
        className="icon-with-rounded-border"
        onClick={() => {
          setShowSettings(false);
        }}
      >
        <img src={backArrow} />
      </div>
    );
  }

  if (selectEditQuestionNumber || selectEditQuestionNumber === 0) {
    return (
      <EditQuestionView
        selectEditQuestionNumber={selectEditQuestionNumber}
        setSelectEditQuestionNumber={setSelectEditQuestionNumber}
      />
    );
  }

  function renderModal() {
    return (
      <>
        <div class={`modal-container visible`}>
          <div class="modal">
            <h4>Reset the quiz race?</h4>
            <p2>
              Players who have finished the current quiz will be able to start
              the new quiz.
            </p2>
            <div class="actions">
              <button
                class="btn-outline"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
              </button>
              <button
                class="btn-danger"
                onClick={() => {
                  setResetButtonClicked(true);
                  dispatch(resetGame());
                }}
                className="start-btn btn-danger"
                disabled={resetButtonClicked}
              >
                {resetButtonClicked ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="admin-view-wrapper">
      {showModal ? renderModal() : ""}
      {getBackArrow()}
      <h2>Settings</h2>

      <div>
        <p style={{ textAlign: "left", marginLeft: "5px" }}>
          <b>Questions</b>
        </p>
      </div>
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        allQuestions?.map((question, index) => (
          <div className="question-box" key={index}>
            <span>Question {index + 1}</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectEditQuestionNumber(index);
              }}
            >
              <img src={penToSquareSvg} className="question-box-img" />
            </span>
          </div>
        ))
      )}

      <div className="footer-fixed" style={{ color: "#00A76F" }}>
        {gameResetFlag ? (
          "The quiz has reset."
        ) : (
          <button
            onClick={() => {
              setShowModal(true);
            }}
            className="start-btn btn-danger"
            disabled={resetButtonClicked}
          >
            {resetButtonClicked ? "Resetting the quiz..." : "Reset Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminView;
