import { Request, Response } from "express";
import { KeyAssetDataObject } from "../types/index.js";
import { errorHandler, getCredentials, DroppedAsset, World } from "../utils/index.js";
import { WorldActivityType } from "@rtsdk/topia";

export const handleStartQuiz = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, urlSlug, username } = credentials;

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });

    const now = new Date();
    await keyAsset.updateDataObject({
      [`results.${profileId}`]: {
        answers: {},
        endTime: null,
        startTime: now,
        username,
      },
    });

    await keyAsset.fetchDataObject();
    const keyAssetDataObject = keyAsset.dataObject as KeyAssetDataObject;

    const world = World.create(urlSlug, { credentials });
    world.triggerActivity({ type: WorldActivityType.GAME_ON, assetId });

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus: keyAssetDataObject.results[profileId],
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleStartQuiz",
      message: "Error updating start time.",
      req,
      res,
    });
  }
};
