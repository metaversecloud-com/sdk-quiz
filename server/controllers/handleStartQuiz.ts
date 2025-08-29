import { Request, Response } from "express";
import { KeyAssetDataObject } from "../types/index.js";
import { errorHandler, getCredentials, DroppedAsset, World, getVisitor } from "../utils/index.js";
import { WorldActivityType } from "@rtsdk/topia";

export const handleStartQuiz = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, sceneDropId, urlSlug, username } = credentials;

    const getVisitorResponse = await getVisitor(credentials);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor } = getVisitorResponse;
    const now = new Date();
    const playerStatus = {
      answers: {},
      endTime: null,
      startTime: now,
      username,
    };

    await visitor.updateDataObject(
      { [`${urlSlug}-${sceneDropId}`]: playerStatus },
      {
        analytics: [
          {
            analyticName: "starts",
            profileId,
            uniqueKey: profileId,
            urlSlug,
          },
        ],
      },
    );

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    const world = World.create(urlSlug, { credentials });
    world.triggerActivity({ type: WorldActivityType.GAME_ON, assetId }).catch((error) =>
      errorHandler({
        error,
        functionName: "handleStartQuiz",
        message: "Error triggering particle effects",
      }),
    );

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus,
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
