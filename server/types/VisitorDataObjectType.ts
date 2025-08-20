export type VisitorStatusType = {
  answers: {
    [questionId: string]: {
      answer: string;
      isCorrect: boolean;
    };
  };
  timeElapsed: string;
  endTime: Date | null;
  startTime: Date | null;
};

export type VisitorDataObjectType = {
  // key = `${urlSlug}-${keyAssetId}`
  [key: string]: VisitorStatusType;
};
