import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getVisitor } from "../utils/index.js";
import { defaultVisitorStatus } from "../constants.js";

export const handleResetQuiz = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, sceneDropId, urlSlug } = credentials;

    const getVisitorResponse = await getVisitor(credentials, true);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor } = getVisitorResponse;
    if (!getVisitorResponse.visitor.isAdmin) throw "User is not an admin.";

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    await visitor.updateDataObject(
      { [`${urlSlug}-${sceneDropId}`]: defaultVisitorStatus },
      { analytics: [{ analyticName: "resets", urlSlug }], lock: { lockId, releaseLock: true } },
    );

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    await keyAsset.updateDataObject({ leaderboard: {} });

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
