import { KeyAssetInterface } from "../../types/KeyAssetTypes.js";
import { errorHandler } from "../errorHandler.js";

export const initializeKeyAssetDataObject = async (keyAsset: KeyAssetInterface) => {
  try {
    await keyAsset.fetchDataObject();

    if (!keyAsset?.dataObject?.numberOfQuestions) {
      const lockId = `${keyAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset.setDataObject(
        {
          numberOfQuestions: 4,
          questions: getDefaultQuestions(4),
          results: {},
        },
        { lock: { lockId } },
      );
    }

    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeKeyAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await keyAsset.fetchDataObject();
  }
};

const getDefaultQuestions = (count: number) => {
  const result: { [key: string]: {} } = {};

  for (let i = 1; i <= count; i++) {
    result[i.toString()] = {
      questionText: `Question ${i} placeholder`,
      options: getDefaultOptions(count),
    };
  }

  return result;
};

const getDefaultOptions = (count: number) => {
  const result: { [key: string]: {} } = {};

  for (let i = 1; i <= count; i++) {
    result[i.toString()] = { isCorrect: i === 1, optionText: `Option ${i} placeholder` };
  }

  return result;
};
