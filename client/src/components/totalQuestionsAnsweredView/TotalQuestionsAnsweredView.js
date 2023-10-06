import React from "react";
import { useSelector } from "react-redux";
import "./TotalQuestionsAnsweredView.scss";

function TotalQuestionsAnsweredView() {
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );

  const profileId = useSelector(
    (state) => state?.session?.visitor?.profile.profileId
  );

  const numberOfQuestionsAnswered =
    droppedAsset?.dataObject?.quiz?.[profileId]?.numberOfQuestionsAnswered || 0;

  return (
    <div className="totalQuestionsAnsweredView">
      <p>
        {numberOfQuestionsAnswered}/
        {startDroppedAsset?.dataObject?.quiz?.results?.length}
      </p>
    </div>
  );
}

export default TotalQuestionsAnsweredView;
