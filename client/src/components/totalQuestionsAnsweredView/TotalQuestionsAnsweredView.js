import React from "react";
import { useSelector } from "react-redux";
import "./TotalQuestionsAnsweredView.scss";

function TotalQuestionsAnsweredView() {
  const totalNumberOfQuestionsInQuiz = useSelector(
    (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  );
  const numberOfQuestionsAnswered = useSelector(
    (state) => state?.session?.questionsAnswered?.numberOfQuestionsAnswered
  );

  return (
    <div className="totalQuestionsAnsweredView">
      <p>
        {numberOfQuestionsAnswered}/{totalNumberOfQuestionsInQuiz}
      </p>
    </div>
  );
}

export default TotalQuestionsAnsweredView;
