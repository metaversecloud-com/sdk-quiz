export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_GAME_STATE = "SET_GAME_STATE";
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

// Question types
export type QuizQuestionType = "multipleChoice" | "allThatApply" | "openText";

export type QuestionType = {
  questionText: string;
  questionType?: QuizQuestionType;
  answer: string;
  correctOptions?: string[];
  options: { [optionId: string]: string };
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
};

// Settings types
export type AssetAppearance = {
  startImage: string;
  questionMarkerImage: string;
  platformImage: string;
  leaderboardImage: string;
};

export type ReplayMode = "manual" | "never";

export type QuizSettings = {
  assetAppearance: AssetAppearance;
  correctAnswerParticle: string;
  completionParticle: string;
  replayMode: ReplayMode;
  showCorrectAnswer: boolean;
  timerEnabled: boolean;
  timerDurationMinutes?: number;
};

export type AnswersType = {
  [questionId: string]: {
    answer: string;
    selectedOptions?: string[];
    isCorrect: boolean;
  };
};

export type LeaderboardEntryType = {
  profileId: string;
  displayName: string;
  score: number;
  timeElapsed: string;
  completionDate?: string;
  questionsAnswered?: number;
  completed?: string;
};

export type QuizType = {
  numberOfQuestions: number;
  questions: {
    [questionId: string]: QuestionType;
  };
  settings?: QuizSettings;
  droppedAssets?: { [key: string]: string };
};

export type VisitorType = { isAdmin: boolean; isInZone: boolean; profileId: string };

export type ResultsType = {
  answers: AnswersType;
  endTime: Date;
  startTime: Date;
  timeElapsed: string;
};

export type ErrorType = string | { message?: string; response?: { data?: { message?: string } } };

export interface InitialState {
  error?: string;
  isConfigured?: boolean;
  playerStatus?: ResultsType;
  hasInteractiveParams?: boolean;
  hasSetupBackend?: boolean;
  interactiveParams?: InteractiveParams;
  quiz?: QuizType;
  visitor?: VisitorType;
  visitorInventory?: { [name: string]: { id: string; icon: string; name: string } };
  leaderboard?: LeaderboardEntryType[];
  badges?: {
    [name: string]: {
      id: string;
      name: string;
      icon: string;
      description: string;
    };
  };
  settings?: QuizSettings | null;
}

export type ActionType = {
  type: string;
  payload: InitialState;
};
