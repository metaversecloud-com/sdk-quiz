import React from "react";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { history } from "../redux/store";

import { Route, Routes } from "react-router-dom";

import Home from "./Home";
import Leaderboard from "./Leaderboard";
import StartClock from "./StartClock";

const PageRoutes = () => {
  return (
    <Router history={history}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/start" element={<StartClock />} />
      </Routes>
    </Router>
  );
};

export default PageRoutes;
