export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_QUIZ = "SET_QUIZ";
export const SET_ERROR = "SET_ERROR";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
};

export type QuestionType = {
  questionText: string;
  options: { [optionId: string]: { optionText: string; isCorrect: boolean } };
};

export type AnswersType = {
  [questionId: string]: {
    answer: string;
    isCorrect: boolean;
  };
};

export type ResultsType = {
  answers: AnswersType;
  endTime: Date;
  startTime: Date;
  timeElapsed: string;
  username: string;
};

export type QuizType = {
  numberOfQuestions: number;
  questions: {
    [questionId: string]: QuestionType;
  };
  results: {
    [profileId: string]: ResultsType;
  };
};

export interface InitialState {
  error?: string;
  gameStatus?: ResultsType;
  hasInteractiveParams?: boolean;
  hasSetupBackend?: boolean;
  interactiveParams?: InteractiveParams;
  quiz?: QuizType;
  visitor?: { isAdmin: boolean; isInZone: boolean; profileId: string };
}

export type ActionType = {
  type: string;
  payload: InitialState;
};

export type LeaderboardType = {
  score: number;
  timeElapsed: string;
  username: string;
};
