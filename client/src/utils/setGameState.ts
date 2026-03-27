import { ActionType, LeaderboardEntryType, QuizType, ResultsType, SET_GAME_STATE, VisitorType, QuizSettings } from "@/context/types";
import { Dispatch } from "react";

export const setGameState = (
  dispatch: Dispatch<ActionType> | null,
  data: {
    isConfigured?: boolean;
    playerStatus?: ResultsType;
    quiz: QuizType;
    visitor?: VisitorType;
    leaderboard?: LeaderboardEntryType[];
    settings?: QuizSettings | null;
  },
) => {
  if (!dispatch || !data.quiz) return;

  const gameState = data;
  gameState.quiz.numberOfQuestions = Object.keys(data.quiz.questions || {}).length;

  dispatch({
    type: SET_GAME_STATE,
    payload: { ...gameState, error: "" },
  });
};
