/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visitor: null,
  droppedAsset: null,
  startDroppedAsset: null,
  questionAsset: null,
  leaderboard: null,
  allQuestionAssets: null,
  questionsAnswered: null,
  startTimestamp: null,
  setGameResetFlag: null,
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
  setStartTimestamp: (state, action) => {
    state.startTimestamp = action.payload;
  },
  setEndTimestamp: (state, action) => {
    state.endTimestamp = action.payload;
  },
  setStartDroppedAsset: (state, action) => {
    state.startDroppedAsset = action.payload;
  },
  setQuestionDroppedAsset: (state, action) => {
    state.questionDroppedAsset = action.payload;
  },
  setAllQuestions: (state, action) => {
    state.allQuestions = action.payload;
  },
  setQuestionAsset: (state, action) => {
    state.questionAsset = action.payload;
  },
  setGameResetFlag: (state, action) => {
    state.gameResetFlag = action.payload;
  },
  setInPrivateZone: (state, action) => {
    state.inPrivateZone = action.payload;
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
