import { Request, Response } from "express";
import {
  DroppedAsset,
  errorHandler,
  getCachedInventoryItems,
  getCredentials,
  getVisitor,
  initializeKeyAssetDataObject,
  sortLeaderboard,
  World,
} from "../utils/index.js";
import { BadgesType, KeyAssetDataObject, KeyAssetInterface, WorldDataObjectType } from "../types/index.js";
import { DroppedAssetInterface } from "@rtsdk/topia";
import { defaultVisitorStatus } from "../constants.js";

export const handleGetQuiz = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, isStartAsset, profileId, sceneDropId, urlSlug } = credentials;
    const forceRefreshInventory = req.query.forceRefreshInventory === "true";

    let keyAssetId = assetId;

    let { visitor, playerStatus, visitorInventory } = await getVisitor(credentials, true);
    const { isAdmin, landmarkZonesString, privateZoneId } = visitor;

    let isInZone = false;
    const landmarkZonesArray = landmarkZonesString?.split(",");
    if (landmarkZonesArray && (landmarkZonesArray.includes(assetId) || privateZoneId === assetId)) isInZone = true;

    const world = World.create(urlSlug, { credentials });
    const dataObject = (await world.fetchDataObject()) as WorldDataObjectType;

    if (!isStartAsset) {
      if (dataObject?.[sceneDropId]?.keyAssetId) {
        keyAssetId = dataObject[sceneDropId].keyAssetId;
      } else {
        const droppedAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({
          sceneDropId,
          uniqueName: "start",
        });
        const keyAsset = droppedAssets[0];
        keyAssetId = keyAsset?.id!;
      }
    } else {
      visitor.updatePublicKeyAnalytics([
        {
          analyticName: "joins",
          profileId,
          uniqueKey: profileId,
          urlSlug,
        },
      ]);
    }

    // Store keyAssetId by sceneDropId in World data object
    if (!dataObject || Object.keys(dataObject).length === 0) {
      await world.setDataObject({ [sceneDropId]: { keyAssetId } });
    } else if (!dataObject[sceneDropId]) {
      await world.updateDataObject({ [sceneDropId]: { keyAssetId } });
    }

    const keyAsset = await DroppedAsset.get(keyAssetId, urlSlug, {
      credentials: { ...credentials, assetId: keyAssetId },
    });

    await keyAsset.fetchDataObject();
    const keyAssetDataObject = keyAsset.dataObject as KeyAssetDataObject;

    // Determine if quiz is configured:
    // - New quizzes: have a `settings` key
    // - Legacy quizzes: have real questions (not just placeholders) in the data object
    const hasSettings = !!keyAssetDataObject?.settings;
    const hasRealQuestions =
      keyAssetDataObject?.questions &&
      Object.keys(keyAssetDataObject.questions).length > 0 &&
      Object.values(keyAssetDataObject.questions).some(
        (q) => !q.questionText.startsWith("Question ") || !q.questionText.endsWith(" placeholder"),
      );
    const isConfigured = hasSettings || !!hasRealQuestions;

    // For unconfigured quizzes (first drop), initialize with default placeholder questions
    if (!hasSettings && !hasRealQuestions) {
      await initializeKeyAssetDataObject(keyAsset as KeyAssetInterface);
      await keyAsset.fetchDataObject();
    }

    const currentDataObject = keyAsset.dataObject as KeyAssetDataObject;
    let leaderboard: Record<string, string> = currentDataObject?.leaderboard || {};

    // Migrate legacy results format to leaderboard
    if (currentDataObject.results) {
      for (const profileId in currentDataObject.results) {
        const { answers, timeElapsed, username } = currentDataObject.results[profileId];
        let score = 0;
        for (const questionId in answers) {
          if (answers[questionId].isCorrect) score++;
        }
        leaderboard[profileId] = `${username}|${score}|${timeElapsed}`;
      }
      currentDataObject.leaderboard = leaderboard;
      delete currentDataObject.results;
      const lockId = `${keyAssetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset.setDataObject(currentDataObject, { lock: { lockId, releaseLock: true } });
    }

    const sortedLeaderboard = await sortLeaderboard(leaderboard);

    if (playerStatus.endTime && !sortedLeaderboard.find((entry) => entry.profileId === profileId)) {
      playerStatus = defaultVisitorStatus;
      await visitor.updateDataObject({ [`${urlSlug}-${sceneDropId}`]: playerStatus }, {});
    }

    const inventoryItems = await getCachedInventoryItems({ credentials, forceRefresh: forceRefreshInventory });

    const badges: BadgesType = {};
    for (const item of inventoryItems) {
      const { id, name, image_path, description, type, status } = item;
      if (name && type === "BADGE" && status === "ACTIVE") {
        badges[name] = {
          id: id,
          name,
          icon: image_path || "",
          description: description || "",
        };
      }
    }

    return res.json({
      isConfigured,
      leaderboard: sortedLeaderboard,
      quiz: currentDataObject,
      visitor: { isAdmin, isInZone, profileId },
      visitorInventory,
      playerStatus,
      badges,
      settings: currentDataObject.settings || null,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetQuiz",
      message: "Error getting quiz details.",
      req,
      res,
    });
  }
};
