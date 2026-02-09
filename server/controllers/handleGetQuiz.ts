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
        });
        const keyAsset = droppedAssets.find((droppedAsset) => droppedAsset.uniqueName === "start");
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

    // store keyAssetId by sceneDropId in World data object so that it can be accessed by any clickable asset
    if (!dataObject || Object.keys(dataObject).length === 0) {
      await world.setDataObject({ [sceneDropId]: { keyAssetId } });
    } else if (!dataObject[sceneDropId]) {
      await world.updateDataObject({ [sceneDropId]: { keyAssetId } });
    }

    const keyAsset = await DroppedAsset.get(keyAssetId, urlSlug, {
      credentials: { ...credentials, assetId: keyAssetId },
    });

    await initializeKeyAssetDataObject(keyAsset as KeyAssetInterface);

    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    let leaderboard: Record<string, string> = keyAssetDataObject?.leaderboard || {};

    if (keyAssetDataObject.results) {
      for (const profileId in keyAssetDataObject.results) {
        const { answers, timeElapsed, username } = keyAssetDataObject.results[profileId];

        let score = 0;
        for (const questionId in answers) {
          if (answers[questionId].isCorrect) score++;
        }

        leaderboard[profileId] = `${username}|${score}|${timeElapsed}`;
      }
      keyAssetDataObject.leaderboard = leaderboard;
      delete keyAssetDataObject.results;
      const lockId = `${keyAssetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset.setDataObject(keyAssetDataObject, { lock: { lockId, releaseLock: true } });
    }

    const sortedLeaderboard = await sortLeaderboard(leaderboard);

    if (playerStatus.endTime && !sortedLeaderboard.find((entry) => entry.profileId === profileId)) {
      playerStatus = defaultVisitorStatus;
      await visitor.updateDataObject({ [`${urlSlug}-${sceneDropId}`]: playerStatus }, {});
    }

    const inventoryItems = await getCachedInventoryItems({ credentials });

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
      leaderboard: sortedLeaderboard,
      quiz: keyAssetDataObject,
      visitor: { isAdmin, isInZone, profileId },
      visitorInventory,
      playerStatus,
      badges,
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
