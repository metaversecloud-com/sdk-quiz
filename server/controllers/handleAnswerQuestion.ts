import { KeyAssetDataObject, WorldDataObjectType } from "../types/index.js";
import { errorHandler, getCredentials, DroppedAsset, World } from "../utils/index.js";
import { Request, Response } from "express";

export const handleAnswerQuestion = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, sceneDropId, urlSlug } = credentials;

    const { isCorrect, selectedOption } = req.body;

    const { questionId } = req.params;
    if (!questionId) throw "Question id is required.";

    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const worldDataObject = world.dataObject as WorldDataObjectType;

    const keyAsset = await DroppedAsset.get(worldDataObject[sceneDropId].keyAssetId, urlSlug, {
      credentials,
    });
    await keyAsset.fetchDataObject();
    const { questions, results } = keyAsset.dataObject as KeyAssetDataObject;

    const now = new Date();
    const numberOfQuestions = Object.keys(questions).length;
    const hasAnsweredAll = Object.keys(results[profileId].answers).length === numberOfQuestions - 1;
    const endTime = hasAnsweredAll ? now : null;

    const durationMs = new Date(endTime || now).getTime() - new Date(results[profileId].startTime).getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    const timeElapsed = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");

    await keyAsset.updateDataObject({
      [`results.${profileId}.answers.${questionId}`]: { answer: selectedOption, isCorrect },
      [`results.${profileId}.endTime`]: endTime,
      [`results.${profileId}.timeElapsed`]: timeElapsed,
    });

    await keyAsset.fetchDataObject();
    const keyAssetDataObject = keyAsset.dataObject as KeyAssetDataObject;

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus: keyAssetDataObject.results[profileId],
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAnswerQuestion",
      message: "Error answering question.",
      req,
      res,
    });
  }
};
