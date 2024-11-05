import { DroppedAsset } from "@rtsdk/topia";

export type KeyAssetDataObject = {
  numberOfQuestions: number;
  questions: {
    [questionId: string]: {
      questionText: string;
      options: [{ optionText: string; isCorrect: boolean }];
    };
  };
  results: {
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
