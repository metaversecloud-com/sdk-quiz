import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import YourResult from "../yourResult/YourResult.js";
import { getLeaderboard } from "../../redux/actions/session.js";
import gear from "../../assets/gear.svg";

function QuizEnded({ setShowSettings, setShowLeaderboard, originAsset }) {
  const dispatch = useDispatch();
  const visitor = useSelector((state) => state?.session?.visitor);

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

  return (
    <div style={{ margin: "0px 14px" }}>
      {visitor?.isAdmin ? getGear() : <></>}
      <div className="quiz-completed-container center-content">
        <p style={{ fontSize: "40px", margin: "0px" }}>🏆</p>
        <h3>Hooray, quiz complete!</h3>
        <p>See how you stack up against others on the leaderboard!</p>
        <div
          style={{
            width: "100%",
            borderBottom: "1px solid #EBEDEF",
            marginTop: "20px",
          }}
        >
          {" "}
        </div>
        <div style={{ marginTop: "20px", height: "48px" }}>
          <p>
            <b>Your result:</b>
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <YourResult />
        </div>
        <div style={{ width: "100%" }}>
          <button
            className="btn-outline"
            onClick={() => {
              // console.log("originAsset", originAsset);
              dispatch(getLeaderboard(originAsset));
              setShowLeaderboard(true);
            }}
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizEnded;
