import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../redux/actions/session";
import "./LeaderboardAssetView.scss";

function AdminView() {
  const dispatch = useDispatch();

  return (
    <div className="center-content">
      <h2>Admin Panel</h2>

      <button onClick={() => dispatch(resetGame())} className="start-btn">
        Reset Game
      </button>
    </div>
  );
}

export default AdminView;
