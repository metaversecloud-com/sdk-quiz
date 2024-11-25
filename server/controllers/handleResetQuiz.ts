import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getVisitor } from "../utils/index.js";

export const handleResetQuiz = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;

    const visitor = await getVisitor(credentials);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    await keyAsset.updateDataObject({
      results: {},
    });

    await keyAsset.fetchDataObject();

    return res.json({ quiz: keyAsset.dataObject, playerStatus: {} });
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
