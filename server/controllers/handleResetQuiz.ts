import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getVisitor, User, World } from "../utils/index.js";
import { defaultVisitorStatus } from "../constants.js";
import { KeyAssetDataObject } from "../types/KeyAssetTypes.js";
import { WorldDataObjectType } from "../types/WorldDataObjectType.js";

export const handleResetQuiz = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId, urlSlug } = credentials;

    const { visitor } = await getVisitor(credentials, true);

    if (!visitor.isAdmin) throw "User is not an admin.";

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;

    const world = World.create(urlSlug, { credentials });
    const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;

    const keyAsset = await DroppedAsset.get(worldDataObject[sceneDropId].keyAssetId, urlSlug, {
      credentials,
    });
    await keyAsset.fetchDataObject();
    const dataObject = keyAsset.dataObject as KeyAssetDataObject;

    for (const profileId of Object.keys(dataObject.leaderboard)) {
      const user = await User.create({ credentials, profileId });
      await user.updateDataObject({ [`${urlSlug}-${sceneDropId}`]: defaultVisitorStatus });
    }

    await keyAsset.updateDataObject(
      { leaderboard: {} },
      { analytics: [{ analyticName: "resets", urlSlug }], lock: { lockId, releaseLock: true } },
    );

    return res.json({ leaderboard: {}, quiz: keyAsset.dataObject, playerStatus: defaultVisitorStatus });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleResetQuiz",
      message: "Error resetting quiz.",
      req,
      res,
    });
  }
};
