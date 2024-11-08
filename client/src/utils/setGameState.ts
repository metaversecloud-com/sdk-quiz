import { ActionType, QuizType, ResultsType, SET_GAME_STATE, VisitorType } from "@/context/types";
import { Dispatch } from "react";

export const setGameState = (
  dispatch: Dispatch<ActionType> | null,
  data: { playerStatus?: ResultsType; quiz: QuizType; visitor?: VisitorType },
) => {
  if (!dispatch || !data.quiz) return;

  const gameState = data;
  gameState.quiz.numberOfQuestions = Object.keys(data.quiz.questions).length;

  dispatch({
    type: SET_GAME_STATE,
    payload: { ...gameState, error: "" },
  });
};
