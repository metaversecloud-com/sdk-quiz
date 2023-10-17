import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import { ClipLoader } from "react-spinners";
import { getLeaderboard } from "../redux/actions/session";
import "./LeaderboardAssetView.scss";
import gear from "../assets/gear.svg";
import AdminView from "./Admin/AdminView";

function Leaderboard({ originAsset }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const leaderboard = useSelector((state) => state?.session?.leaderboard);
  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );
  const visitor = useSelector((state) => state?.session?.visitor);

  useEffect(() => {
    const fetchDroppedAsset = async () => {
      await dispatch(getLeaderboard(originAsset));
      setLoading(false);
    };

    fetchDroppedAsset();
  }, [dispatch]);

  function getGear() {
    return (
      <div
        style={{ position: "absolute", left: "16px", top: "24px" }}
        className="icon-with-rounded-border"
        onClick={() => {
          setShowSettings(true);
        }}
      >
        <img src={gear} />
      </div>
    );
  }

  if (showSettings) {
    return <AdminView setShowSettings={setShowSettings} />;
  }

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  return (
    <>
      {visitor.isAdmin ? getGear() : <></>}
      <div className="leaderboard-container">
        <div
          style={{ textAlign: "center" }}
          className={visitor?.isAdmin ? "pt-46" : ""}
        >
          <h1 className="trophy">🏆</h1>
        </div>
        <div style={{ margin: "15px 0px" }}>
          <h3>Leaderboard</h3>
        </div>
        <table className="leaderboard-table">
          <p style={{ textAlign: "center" }}>
            {leaderboard?.length == 0 ? "There are no race finishes yet." : ""}
          </p>
          <tbody>
            {leaderboard?.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry?.username}</td>
                <td>
                  <span className="hug">
                    {entry?.score}/
                    {startDroppedAsset?.dataObject?.quiz?.results?.length}
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
    </>
  );
}

export default Leaderboard;
