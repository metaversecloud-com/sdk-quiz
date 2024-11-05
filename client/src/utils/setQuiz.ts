import { ActionType, QuizType, SET_QUIZ } from "@/context/types";
import { Dispatch } from "react";

export const setQuiz = (dispatch: Dispatch<ActionType> | null, quiz: QuizType) => {
  if (!dispatch || !quiz) return;

  dispatch({
    type: SET_QUIZ,
    payload: { ...quiz, error: "" },
  });
};
