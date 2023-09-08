import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import {
  getDroppedAsset,
  getVisitor,
  startClock,
  getQuestionsAnsweredFromStart,
  getOrUpdateTimestamp,
} from "../redux/actions/session";
import "./StartClock.scss";
import Leaderboard from "./Leaderboard";

function StartClock() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const visitor = useSelector((state) => state?.session?.visitor);
  const totalNumberOfQuestionsInQuiz = useSelector(
    (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  );
  const numberOfQuestionsAnswered = useSelector(
    (state) => state?.session?.questionsAnswered?.numberOfQuestionsAnswered
  );
  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getVisitor());
      await dispatch(getQuestionsAnsweredFromStart());
      await dispatch(getOrUpdateTimestamp());

      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (
    numberOfQuestionsAnswered != 0 &&
    numberOfQuestionsAnswered < totalNumberOfQuestionsInQuiz
  ) {
    return (
      <div className="quiz-ongoing-container">
        <h2>Quiz Still Ongoing!</h2>
        <p>Please answer all the questions to proceed.</p>
      </div>
    );
  } else if (numberOfQuestionsAnswered === totalNumberOfQuestionsInQuiz) {
    return (
      <div className="quiz-completed-container">
        <h2>Thank you for participating!</h2>
        <p>
          You have answered all the questions in the quiz. We appreciate your
          effort.
        </p>
      </div>
    );
  } else if (numberOfQuestionsAnswered === 0 && startTimestamp) {
    return (
      <div className="quiz-ongoing-container">
        <h2>The quiz started! </h2>
        <p>Try to answer all questions in the shortest possible time.</p>
      </div>
    );
  }

  return (
    <div className="start-container">
      <h2>Welcome to the Quiz!</h2>
      <p>
        Test your knowledge and see how much you know. Try to answer all
        questions in the shortest possible time.
      </p>
      <button onClick={() => dispatch(startClock())} className="start-btn">
        Start
      </button>
    </div>
  );
}

export default StartClock;
