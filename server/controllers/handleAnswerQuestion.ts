import { KeyAssetDataObject, VisitorStatusType, WorldDataObjectType } from "../types/index.js";
import { errorHandler, getCredentials, DroppedAsset, World, getVisitor } from "../utils/index.js";
import { Request, Response } from "express";

export const handleAnswerQuestion = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, urlSlug } = credentials;

    const { isCorrect, selectedOption } = req.body;

    const { questionId } = req.params;
    if (!questionId) throw "Question id is required.";

    const getVisitorResponse = await getVisitor(credentials);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor, playerStatus } = getVisitorResponse;
    const { answers, endTime, startTime } = playerStatus;

    const world = World.create(urlSlug, { credentials });
    const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;

    const keyAsset = await DroppedAsset.get(worldDataObject[sceneDropId].keyAssetId, urlSlug, {
      credentials,
    });
    await keyAsset.fetchDataObject();
    const { questions } = keyAsset.dataObject as KeyAssetDataObject;

    const now = new Date();
    const numberOfQuestions = Object.keys(questions).length;
    const hasAnsweredAll = Object.keys(answers).length === numberOfQuestions - 1;

    const durationMs = new Date(endTime || now).getTime() - new Date(startTime || now).getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);

    const updatedStatus: VisitorStatusType = playerStatus;
    updatedStatus.answers[questionId] = { answer: selectedOption, isCorrect };
    updatedStatus.endTime = hasAnsweredAll ? now : null;
    updatedStatus.timeElapsed = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");

    await visitor.updateDataObject({ [`${urlSlug}-${sceneDropId}`]: updatedStatus }, {});

    if (hasAnsweredAll) {
      let score = 0;
      for (const questionId in answers) {
        if (answers[questionId].isCorrect) score++;
      }
      keyAsset.updateDataObject({
        [`leaderboard.${profileId}`]: `${displayName}|${score}|${updatedStatus.timeElapsed}`,
      });
    }

    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus: updatedStatus,
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
