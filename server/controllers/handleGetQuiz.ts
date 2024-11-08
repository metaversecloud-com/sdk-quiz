import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getVisitor, World } from "../utils/index.js";
import { KeyAssetDataObject, KeyAssetInterface, WorldDataObjectType } from "../types/index.js";
import { DroppedAssetInterface } from "@rtsdk/topia";
import { initializeKeyAssetDataObject } from "../utils/droppedAssets/initializeKeyAssetDataObject.js";

export const handleGetQuiz = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, isStartAsset, sceneDropId, urlSlug } = credentials;

    let keyAssetId = assetId;

    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObjectType;

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

    const visitor = await getVisitor(credentials);
    const { isAdmin, landmarkZonesString, privateZoneId, profileId } = visitor;

    let isInZone = false;
    const landmarkZonesArray = landmarkZonesString.split(",");
    if (landmarkZonesArray.includes(assetId) || privateZoneId === assetId) isInZone = true;

    await keyAsset.fetchDataObject();
    const keyAssetDataObject = keyAsset.dataObject as KeyAssetDataObject;

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus: keyAssetDataObject.results[profileId],
      visitor: { isAdmin, isInZone, profileId },
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
