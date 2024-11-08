import { DroppedAsset } from "@rtsdk/topia";

export type KeyAssetDataObject = {
  questions: {
    [questionId: string]: {
      questionText: string;
      answer: string;
      options: { [key: string]: string };
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
