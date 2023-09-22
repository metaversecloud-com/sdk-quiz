import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import { ClipLoader } from "react-spinners";
import {
  getDroppedAsset,
  getVisitor,
  getLeaderboard,
  getQuestionsStatistics,
} from "../redux/actions/session";
import "./LeaderboardAssetView.scss";

function Leaderboard() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const visitor = useSelector((state) => state?.session?.visitor);
  const leaderboard = useSelector((state) => state?.session?.leaderboard);
  const totalNumberOfQuestionsInQuiz = useSelector(
    (state) => state?.session?.questionsAnswered?.totalNumberOfQuestionsInQuiz
  );

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getDroppedAsset());
      await dispatch(getVisitor());
      await dispatch(getLeaderboard());
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

  return (
    <div className="leaderboard-container">
      <div style={{ textAlign: "center" }}>
        <h1 className="trophy">🏆</h1>
      </div>
      <div style={{ margin: "15px 0px" }}>
        <h3>Leaderboard</h3>
      </div>
      <table className="leaderboard-table">
        <tbody>
          {leaderboard?.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry?.username}</td>
              <td>
                <span className="hug">
                  {entry?.score}/{totalNumberOfQuestionsInQuiz}
                </span>
              </td>
              <td>
                <span className="hug">
                  {moment.utc(entry?.timeElapsed).format("HH:mm:ss")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
