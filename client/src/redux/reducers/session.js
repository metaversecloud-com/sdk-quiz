/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visitor: null,
  droppedAsset: null,
  leaderboard: null,
  questionsAnswered: null,
  startTimestamp: null,
  error: null,
};

const reducers = {
  setVisitor: (state, action) => {
    state.visitor = action.payload;
  },
  setDroppedAsset: (state, action) => {
    state.droppedAsset = action.payload;
  },
  setLeaderboard: (state, action) => {
    state.leaderboard = action.payload;
  },
  setQuestionsAnswered: (state, action) => {
    state.questionsAnswered = action.payload;
  },
  setTimestamp: (state, action) => {
    state.startTimestamp = action.payload;
  },
  setError: (state, action) => {
    state.error = action.payload;
  },
};

export const session = createSlice({
  name: "session",
  initialState,
  reducers,
});
