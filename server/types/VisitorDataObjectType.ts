export type VisitorAnswerType = {
  answer: string;
  selectedOptions?: string[]; // for allThatApply questions
  isCorrect: boolean;
};

export type VisitorStatusType = {
  answers: {
    [questionId: string]: VisitorAnswerType;
  };
  timeElapsed: string;
  endTime: Date | null;
  startTime: Date | null;
};

export type VisitorDataObjectType = {
  // key = `${urlSlug}-${keyAssetId}`
  [key: string]: VisitorStatusType;
};
