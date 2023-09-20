import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import { getQuestionsStatistics } from "../redux/actions/session";
import "./StartAssetView.scss";

function TotalQuestionsAnsweredView() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalNumberOfQuestionsInQuiz = useSelector(
    (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  );
  const numberOfQuestionsAnswered = useSelector(
    (state) => state?.session?.questionsAnswered?.numberOfQuestionsAnswered
  );

  const startTimestamp = useSelector((state) => state?.session?.startTimestamp);
  const endTimestamp = useSelector((state) => state?.session?.endTimestamp);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getQuestionsStatistics());

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

  const shouldRenderTotalQuestionsAnswered = () => {
    if (startTimestamp && !endTimestamp) {
      return true;
    } else if (numberOfQuestionsAnswered === 0 && startTimestamp) {
      return true;
    } else {
      return false;
    }
  };

  if (!shouldRenderTotalQuestionsAnswered()) {
    return <></>;
  }
  return (
    <div>
      {numberOfQuestionsAnswered}/{totalNumberOfQuestionsInQuiz}
    </div>
  );
}

export default TotalQuestionsAnsweredView;
