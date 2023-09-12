import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import moment from "moment-timezone";
import {
  getDroppedAsset,
  getVisitor,
  getLeaderboard,
} from "../redux/actions/session";
import "./Leaderboard.scss";

function Leaderboard() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(null);

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

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;