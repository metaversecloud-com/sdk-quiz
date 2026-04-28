import { AssetAppearance, QuizSettings } from "../types/index.js";

export const ASSET_IMAGES = {
  start: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/start_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/start_2.png",
  ],
  questionMarker: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/auestionMarker_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/auestionMarker_2.png",
  ],
  platform: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_2.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_3.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_4.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_5.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/platfom_6.png",
  ],
  leaderboard: [
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/leaderboard_1.png",
    "https://sdk-quiz.s3.us-east-1.amazonaws.com/leaderboard_2.png",
  ],
};

export const DEFAULT_ASSET_APPEARANCE: AssetAppearance = {
  startImage: "https://sdk-quiz.s3.us-east-1.amazonaws.com/newQuiz.png",
  questionMarkerImage: ASSET_IMAGES.questionMarker[0],
  platformImage: ASSET_IMAGES.platform[0],
  leaderboardImage: ASSET_IMAGES.leaderboard[0],
};

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  assetAppearance: DEFAULT_ASSET_APPEARANCE,
  correctAnswerParticle: "brain_float",
  completionParticle: "partyPopper_float",
  replayMode: "manual",
  showCorrectAnswer: true,
  timerEnabled: true,
};
