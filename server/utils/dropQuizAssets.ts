import { Request } from "express";
import { Asset, DroppedAsset } from "./topiaInit.js";
import { AssetAppearance, DroppedAssetMap } from "../types/index.js";
import { Credentials } from "../types/Credentials.js";
import { DroppedAssetClickType } from "@rtsdk/topia";

const getBaseUrl = (req: Request): string => {
  if (process.env.NODE_ENV === "development") {
    return process.env.NGROK_URL || `https://${req.hostname}`;
  }
  return `https://${req.hostname}`;
};

export const dropQuestionAsset = async ({
  credentials,
  questionId,
  position,
  appearance,
  req,
}: {
  credentials: Credentials;
  questionId: string;
  position: { x: number; y: number };
  appearance: AssetAppearance;
  req: Request;
}) => {
  const { interactivePublicKey, sceneDropId, urlSlug } = credentials;
  const baseUrl = getBaseUrl(req);

  const asset = Asset.create(process.env.WEB_IMAGE_ASSET_ID || "webImageAsset", { credentials });

  const droppedAsset = await DroppedAsset.drop(asset, {
    // clickableLink: `${baseUrl}/question/${questionId}`,
    // clickableLinkTitle: `Question ${questionId}`,
    // clickType: DroppedAssetClickType.LINK,
    isInteractive: true,
    interactivePublicKey,
    layer0: appearance.platformImage,
    layer1: appearance.questionMarkerImage,
    position,
    sceneDropId,
    uniqueName: `Quiz_question_${questionId}`,
    urlSlug,
  });

  // Set up as interactive webhook zone
  await Promise.all([
    droppedAsset.updateWebhookZone(true),
    droppedAsset.updateLandmarkZone({ isLandmarkZoneEnabled: true }),
    droppedAsset.addWebhook({
      dataObject: {},
      description: `Quiz Question ${questionId}`,
      isUniqueOnly: false,
      shouldSetClickType: false,
      title: `Question ${questionId}`,
      type: "webhookZoneEntered",
      url: `${baseUrl}/api/iframe/${questionId}`,
    }),
  ]);

  return droppedAsset;
};

export const dropLeaderboardAsset = async ({
  credentials,
  position,
  appearance,
  req,
}: {
  credentials: Credentials;
  position: { x: number; y: number };
  appearance: AssetAppearance;
  req: Request;
}) => {
  const { interactivePublicKey, sceneDropId, urlSlug } = credentials;
  const baseUrl = getBaseUrl(req);

  const asset = Asset.create(process.env.WEB_IMAGE_ASSET_ID || "webImageAsset", { credentials });

  const droppedAsset = await DroppedAsset.drop(asset, {
    clickableLink: `${baseUrl}/leaderboard`,
    clickableLinkTitle: "Quiz Leaderboard",
    clickType: DroppedAssetClickType.LINK,
    isInteractive: true,
    isOpenLinkInDrawer: true,
    interactivePublicKey,
    layer0: appearance.leaderboardImage,
    position,
    sceneDropId,
    uniqueName: "Quiz_leaderboard",
    urlSlug,
  });

  return droppedAsset;
};

export const dropAllQuizAssets = async ({
  credentials,
  questions,
  appearance,
  startPosition,
  req,
}: {
  credentials: Credentials;
  questions: { [questionId: string]: any };
  appearance: AssetAppearance;
  startPosition: { x: number; y: number };
  req: Request;
}): Promise<DroppedAssetMap> => {
  const droppedAssets: DroppedAssetMap = {};
  const questionIds = Object.keys(questions);

  // Drop question assets sequentially to avoid race conditions
  for (let i = 0; i < questionIds.length; i++) {
    const questionId = questionIds[i];
    const position = {
      x: startPosition.x + 150 * (i + 1),
      y: startPosition.y,
    };

    const droppedAsset = await dropQuestionAsset({
      credentials,
      questionId,
      position,
      appearance,
      req,
    });
    droppedAssets[questionId] = droppedAsset.id!;
  }

  // Drop leaderboard asset to the left of the key asset
  const leaderboardPosition = {
    x: startPosition.x - 100 * (questionIds.length + 1),
    y: startPosition.y,
  };

  const leaderboardAsset = await dropLeaderboardAsset({
    credentials,
    position: leaderboardPosition,
    appearance,
    req,
  });
  droppedAssets.leaderboard = leaderboardAsset.id!;

  return droppedAssets;
};
