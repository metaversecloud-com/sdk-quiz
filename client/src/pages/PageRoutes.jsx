import React from "react";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { history } from "../redux/store";

import { Route, Routes } from "react-router-dom";

import QuestionAssetView from "./QuestionAssetView";
import LeaderboardAssetView from "./LeaderboardAssetView";
import StartAssetView from "./StartAssetView";
import AdminView from "./AdminView";

const PageRoutes = () => {
  return (
    <Router history={history}>
      <Routes>
        <Route path="/questions" element={<QuestionAssetView />} />
        <Route path="/leaderboard" element={<LeaderboardAssetView />} />
        <Route path="/start" element={<StartAssetView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </Router>
  );
};

export default PageRoutes;
