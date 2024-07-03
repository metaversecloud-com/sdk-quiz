import React from "react";
import { useSelector } from "react-redux";
import "./YourResult.scss";

function YourResult() {
  const world = useSelector((state) => state?.session?.world);

  const profileId = useSelector(
    (state) => state?.session?.visitor?.profile.profileId
  );

  const allResults = world?.dataObject?.quiz?.results || [];
  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);

  let timeSpent = "00:00";
  if (startTimestamp && endTimestamp) {
    const durationMs = endTimestamp - startTimestamp;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    timeSpent =
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
  }

  function countCorrectAnswers() {
    let correctAnswersCount = 0;

    Object.values(allResults?.[profileId])?.forEach((item) => {
      if (item && item?.isCorrect) {
        correctAnswersCount++;
      }
    });

    return correctAnswersCount;
  }

  return (
    <>
      <div
        className="green-outline"
        style={{
          borderRadius: "100px",
          border: "1px solid #00A76F",
          background: "#FFF",
          padding: "2px 12px",
          display: "flex",
          alignItems: "center",
          color: "#00A76F",
        }}
      >
        <div className="">
          {countCorrectAnswers()}/
          {world?.dataObject?.quiz?.numberOfQuestionsThatBelongToQuiz}
        </div>
      </div>
      <div
        className="green-outline"
        style={{
          borderRadius: "100px",
          border: "1px solid #00A76F",
          background: "#FFF",
          padding: "2px 12px",
          display: "flex",
          alignItems: "center",
          color: "#00A76F",
        }}
      >
        <div className="">{timeSpent}</div>
      </div>
    </>
  );
}

export default YourResult;
