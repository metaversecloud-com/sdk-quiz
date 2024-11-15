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
        <div className={`modal-container visible`}>
          <div className="modal">
            <h4>Reset the quiz race?</h4>
            <p>
              Players who have finished the current quiz will be able to start
              the new quiz.
            </p>
            <div className="actions">
              <button
                className="btn-outline"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                Close
              </button>
              <button
                className="btn-danger"
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
    <>
      {getBackArrow()}
      <div className="admin-view-wrapper pt-46">
        {showModal ? renderModal() : ""}
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
            <p style={{ color: "#00875A" }}>The quiz has reset.</p>
          ) : (
            <></>
          )}
          <button
            onClick={() => {
              setShowModal(true);
            }}
            className="start-btn btn-danger"
            disabled={resetButtonClicked || gameResetFlag}
          >
            {resetButtonClicked ? "Resetting the quiz..." : "Reset Quiz"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminView;
