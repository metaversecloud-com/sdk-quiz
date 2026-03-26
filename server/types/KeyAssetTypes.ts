import { DroppedAsset } from "@rtsdk/topia";

// Question types
export type QuizQuestionType = "multipleChoice" | "allThatApply";

export type QuestionDefinition = {
  questionText: string;
  questionType: QuizQuestionType;
  options: { [key: string]: string };
  answer: string; // for multipleChoice: single option key
  correctOptions?: string[]; // for allThatApply: array of option keys
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
};

// Legacy question type (no questionType field)
export type LegacyQuestionDefinition = {
  questionText: string;
  answer: string;
  options: { [key: string]: string };
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

export type DroppedAssetMap = {
  [key: string]: string; // questionId -> droppedAssetId, plus "leaderboard" key
};

// Main data object
export type KeyAssetDataObject = {
  leaderboard: {
    [profileId: string]: string;
  };
  questions: {
    [questionId: string]: QuestionDefinition | LegacyQuestionDefinition;
  };
  // New fields (presence of settings = new/configured quiz)
  settings?: QuizSettings;
  droppedAssets?: DroppedAssetMap;
  // Legacy field for migration
  results?: {
    [profileId: string]: {
      answers: {
        [questionId: string]: {
          answer: string;
          isCorrect: boolean;
        };
      };
      timeElapsed: number;
      endTime: Date;
      startTime: Date;
      username: string;
    };
  };
};

export interface KeyAssetInterface extends DroppedAsset {
  dataObject?: KeyAssetDataObject;
}
