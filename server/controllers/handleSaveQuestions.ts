import { Request, Response } from "express";
import { DroppedAsset, dropQuestionAsset, errorHandler, getCredentials, getVisitor, World } from "../utils/index.js";
import { AssetAppearance, KeyAssetDataObject, QuestionDefinition } from "../types/index.js";
import { DEFAULT_ASSET_APPEARANCE, DEFAULT_QUIZ_SETTINGS } from "../utils/constants.js";

export const handleSaveQuestions = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;

    const { visitor } = await getVisitor(credentials, true);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const { questions, assetAppearance } = req.body as {
      questions: { [questionId: string]: QuestionDefinition };
      assetAppearance?: AssetAppearance;
    };

    if (!questions || Object.keys(questions).length === 0) throw "At least one question is required.";

    for (const [qId, question] of Object.entries(questions)) {
      if (!question.questionText) throw `Question ${qId} is missing question text.`;
      if (!question.options || Object.keys(question.options).length < 2) {
        throw `Question ${qId} must have at least 2 options.`;
      }
    }

    // Get key asset and its data object
    const keyAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials: { ...credentials, assetId },
    });
    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    const appearance = assetAppearance || keyAssetDataObject.settings?.assetAppearance || DEFAULT_ASSET_APPEARANCE;
    const existingQuestionIds = new Set(
      Object.keys(keyAssetDataObject.droppedAssets || {}).filter((k) => k !== "leaderboard"),
    );

    // Separate new vs existing questions
    const newQuestions = Object.entries(questions).filter(([qId]) => !existingQuestionIds.has(qId));
    const updatedQuestions = Object.entries(questions).filter(([qId]) => existingQuestionIds.has(qId));

    // Build a single data object update
    const dataObjectUpdates: Record<string, any> = {};

    // Drop assets for new questions
    for (let i = 0; i < newQuestions.length; i++) {
      const [questionId, question] = newQuestions[i];
      const positionOffset = (existingQuestionIds.size + i + 1) * 150;

      const droppedAsset = await dropQuestionAsset({
        credentials,
        questionId,
        position: {
          x: keyAsset.position.x + positionOffset,
          y: keyAsset.position.y,
        },
        appearance,
        req,
      });

      dataObjectUpdates[`questions.${questionId}`] = question;
      dataObjectUpdates[`droppedAssets.${questionId}`] = droppedAsset.id;
    }

    // Add updated questions to the same update
    for (const [questionId, question] of updatedQuestions) {
      dataObjectUpdates[`questions.${questionId}`] = question;
    }

    // Single data object update
    const lockId = `${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    await keyAsset.updateDataObject(dataObjectUpdates, { lock: { lockId, releaseLock: true } });

    const updatedDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    return res.json({
      success: true,
      quiz: updatedDataObject,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleSaveQuestions",
      message: "Error saving questions.",
      req,
      res,
    });
  }
};
