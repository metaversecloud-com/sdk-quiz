import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../redux/actions/session";
import "./LeaderboardAssetView.scss";

function AdminView() {
  const dispatch = useDispatch();
  const [resetButtonClicked, setResetButtonClicked] = useState(false);

  const startDroppedAsset = useSelector(
    (state) => state?.session?.startDroppedAsset
  );

  return (
    <div className="center-content">
      <h2>Admin Panel</h2>

      {console.log("startDroppedAsset", startDroppedAsset)}
      {startDroppedAsset ? (
        "The game restarted."
      ) : (
        <button
          onClick={() => {
            setResetButtonClicked(true);
            dispatch(resetGame());
          }}
          className="start-btn"
          disabled={resetButtonClicked}
        >
          {resetButtonClicked ? "Restarting game..." : "Restart Game"}
        </button>
      )}
    </div>
  );
}

export default AdminView;
