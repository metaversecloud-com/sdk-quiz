import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getVisitor } from "../utils/index.js";

export const handleUpdateQuestion = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;

    const { questionId, updatedQuestion } = req.body;

    if ((!questionId && questionId != 0) || !updatedQuestion) {
      throw "Missing questionId or updatedQuestion fields.";
    }

    const visitor = await getVisitor(credentials);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    await keyAsset.updateDataObject({
      [`questions.${questionId}`]: updatedQuestion,
    });

    await keyAsset.fetchDataObject();

    return res.json({ quiz: keyAsset.dataObject });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleUpdateQuestion",
      message: "Error updating question.",
      req,
      res,
    });
  }
};
