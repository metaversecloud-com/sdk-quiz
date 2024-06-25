import React from "react";
import { useSelector } from "react-redux";
import "./TotalQuestionsAnsweredView.scss";

function TotalQuestionsAnsweredView() {
  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );

  const profileId = useSelector(
    (state) => state?.session?.visitor?.profile.profileId
  );

  return (
    <div className="totalQuestionsAnsweredView">
      <p>
        {startDroppedAsset?.dataObject?.quiz?.[profileId]
          ? getNumberOfQuestionsAnswered(
              startDroppedAsset?.dataObject?.quiz?.results?.[profileId]
            )
          : "0"}
        /
        {startDroppedAsset?.dataObject?.quiz?.numberOfQuestionsThatBelongToQuiz}
      </p>
    </div>
  );
}

export default TotalQuestionsAnsweredView;

function getNumberOfQuestionsAnswered(allQuestions) {
  let numberOfQuestionsAnswered = 0;

  Object.values(allQuestions).forEach((item) => {
    if (item && item?.isCorrect) {
      numberOfQuestionsAnswered++;
    }
  });

  return numberOfQuestionsAnswered;
}
