import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import { ClipLoader } from "react-spinners";
import {
  getDroppedAsset,
  getVisitor,
  getLeaderboard,
} from "../redux/actions/session";
import "./LeaderboardAssetView.scss";

function Leaderboard() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const visitor = useSelector((state) => state?.session?.visitor);
  const leaderboard = useSelector((state) => state?.session?.leaderboard);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getDroppedAsset());
      await dispatch(getVisitor());
      await dispatch(getLeaderboard());
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

  if (!leaderboard) {
    return (
      <div className="leaderboard-container">
        <p>Be the first and fill the leaderboard by answering the quiz!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard?.map((entry, index) => (
            <tr key={index}>
              <td>{entry?.username}</td>
              <td>{entry?.score}</td>
              <td>{moment.utc(entry?.timeElapsed).format("HH:mm:ss")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
