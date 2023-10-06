import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../../redux/actions/session";
import penToSquareSvg from "../../assets/pen-to-square-regular.svg";
import EditQuestionView from "./EditQuestionView";
import { getAllQuestions } from "../../redux/actions/session";
import "./AdminView.scss";

function AdminView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [resetButtonClicked, setResetButtonClicked] = useState(false);
  const [selectEditQuestionNumber, setSelectEditQuestionNumber] =
    useState(false);

  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );

  const allQuestions = useSelector((state) => state?.session?.allQuestions);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getAllQuestions());
      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  console.log("selectEditQuestionNumber", selectEditQuestionNumber);
  if (selectEditQuestionNumber || selectEditQuestionNumber === 0) {
    return (
      <EditQuestionView
        selectEditQuestionNumber={selectEditQuestionNumber}
        setSelectEditQuestionNumber={setSelectEditQuestionNumber}
      />
    );
  }

  return (
    <div className="admin-view-wrapper">
      <h2>Settings</h2>

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

      <div className="footer-fixed">
        {startDroppedAsset ? (
          "The quiz has reset."
        ) : (
          <button
            onClick={() => {
              setResetButtonClicked(true);
              dispatch(resetGame());
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
