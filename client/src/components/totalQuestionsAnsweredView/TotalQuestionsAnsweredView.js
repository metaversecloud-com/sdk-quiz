import React from "react";
import { useSelector } from "react-redux";
import "./TotalQuestionsAnsweredView.scss";

function TotalQuestionsAnsweredView() {
  // const totalNumberOfQuestionsInQuiz = useSelector(
  //   (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  // );
  // const numberOfQuestionsAnswered = useSelector(
  //   (state) => state?.session?.questionsAnswered?.numberOfQuestionsAnswered
  // );

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);

  const profileId = useSelector(
    (state) => state?.session?.visitor?.profile.profileId
  );

  const totalNumberOfQuestionsInQuiz =
    droppedAsset?.dataObject?.quiz?.numberOfQuestionsThatBelongToQuiz;

  const numberOfQuestionsAnswered =
    droppedAsset?.dataObject?.quiz?.[profileId]?.numberOfQuestionsAnswered || 0;

  return (
    <div className="totalQuestionsAnsweredView">
      <p>
        {numberOfQuestionsAnswered}/{totalNumberOfQuestionsInQuiz}
      </p>
    </div>
  );
}

export default TotalQuestionsAnsweredView;
