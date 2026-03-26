import { Request, Response } from "express";
import {
  DroppedAsset,
  errorHandler,
  getCredentials,
  getVisitor,
  removeQuizAsset,
  World,
} from "../utils/index.js";
import { KeyAssetDataObject } from "../types/index.js";
import { WorldDataObjectType } from "../types/WorldDataObjectType.js";

export const handleDeleteQuestion = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, sceneDropId } = credentials;

    const { visitor } = await getVisitor(credentials, true);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const { questionId } = req.params;
    if (!questionId) throw "Question ID is required.";

    // Get key asset
    const world = World.create(urlSlug, { credentials });
    const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;
    const keyAssetId = worldDataObject[sceneDropId]?.keyAssetId || assetId;

    const keyAsset = await DroppedAsset.get(keyAssetId, urlSlug, {
      credentials: { ...credentials, assetId: keyAssetId },
    });
    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    if (!keyAssetDataObject.settings) throw "Quiz has not been configured yet.";
    if (!keyAssetDataObject.questions[questionId]) throw `Question ${questionId} not found.`;

    const remainingQuestions = { ...keyAssetDataObject.questions };
    delete remainingQuestions[questionId];

    if (Object.keys(remainingQuestions).length === 0) {
      throw "Cannot delete the last question. A quiz must have at least one question.";
    }

    // Remove the dropped asset from the world
    const droppedAssetId = keyAssetDataObject.droppedAssets?.[questionId];
    if (droppedAssetId) {
      await removeQuizAsset({ credentials, droppedAssetId });
    }

    // Remove dropped asset reference
    const updatedDroppedAssets = { ...keyAssetDataObject.droppedAssets };
    delete updatedDroppedAssets[questionId];

    // Renumber questions and droppedAssets sequentially starting from "1"
    const renumberedQuestions: typeof remainingQuestions = {};
    const renumberedDroppedAssets: typeof updatedDroppedAssets = {};
    const oldKeys = Object.keys(remainingQuestions).sort((a, b) => Number(a) - Number(b));
    oldKeys.forEach((oldKey, index) => {
      const newKey = (index + 1).toString();
      renumberedQuestions[newKey] = remainingQuestions[oldKey];
      if (updatedDroppedAssets[oldKey]) {
        renumberedDroppedAssets[newKey] = updatedDroppedAssets[oldKey];
      }
    });
    // Preserve leaderboard droppedAsset reference if it exists
    if (updatedDroppedAssets.leaderboard) {
      renumberedDroppedAssets.leaderboard = updatedDroppedAssets.leaderboard;
    }

    const lockId = `${keyAssetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    await keyAsset.setDataObject(
      {
        ...keyAssetDataObject,
        questions: renumberedQuestions,
        droppedAssets: renumberedDroppedAssets,
      },
      { lock: { lockId, releaseLock: true } },
    );

    const updatedDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    return res.json({
      isConfigured: true,
      quiz: updatedDataObject,
      settings: updatedDataObject.settings || null,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleDeleteQuestion",
      message: "Error deleting question.",
      req,
      res,
    });
  }
};
