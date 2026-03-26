import { Request, Response } from "express";
import {
  DroppedAsset,
  dropLeaderboardAsset,
  errorHandler,
  getCredentials,
  getVisitor,
  World,
  DEFAULT_QUIZ_SETTINGS,
} from "../utils/index.js";
import { KeyAssetDataObject, QuizSettings } from "../types/index.js";
import { WorldDataObjectType } from "../types/WorldDataObjectType.js";

export const handleUpdateSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, sceneDropId, urlSlug } = credentials;

    const { settings } = req.body as { settings: Partial<QuizSettings> };
    if (!settings) throw "Settings are required.";

    const { visitor } = await getVisitor(credentials, true);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const world = World.create(urlSlug, { credentials });

    const keyAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials: { ...credentials, assetId },
    });
    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    // Merge settings with existing or defaults
    const baseSettings = keyAssetDataObject.settings || DEFAULT_QUIZ_SETTINGS;
    const updatedSettings: QuizSettings = {
      ...baseSettings,
      ...settings,
      assetAppearance: {
        ...baseSettings.assetAppearance,
        ...settings?.assetAppearance,
      },
    };

    // Ensure leaderboard asset exists — find by uniqueName or drop a new one
    let leaderboardAssetId = keyAssetDataObject.droppedAssets?.leaderboard;

    if (!leaderboardAssetId) {
      // Try to find an existing leaderboard asset by uniqueName
      const existingLeaderboards = await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId,
        uniqueName: "Quiz_leaderboard",
      });

      if (existingLeaderboards && existingLeaderboards.length > 0) {
        leaderboardAssetId = existingLeaderboards[0].id;
      } else {
        // Drop a new leaderboard asset
        const leaderboardAsset = await dropLeaderboardAsset({
          credentials,
          position: {
            x: keyAsset.position.x - 200,
            y: keyAsset.position.y,
          },
          appearance: updatedSettings.assetAppearance,
          req,
        });
        leaderboardAssetId = leaderboardAsset.id!;
      }
    }

    // If asset appearance changed and assets exist, update them
    const appearanceChanged =
      settings.assetAppearance &&
      JSON.stringify(settings.assetAppearance) !== JSON.stringify(baseSettings.assetAppearance);

    if (appearanceChanged && keyAssetDataObject.droppedAssets) {
      const updatePromises: Promise<any>[] = [];

      // Update question assets
      for (const [questionId, droppedAssetId] of Object.entries(keyAssetDataObject.droppedAssets)) {
        if (
          updatedSettings.assetAppearance.questionMarkerImage !== baseSettings.assetAppearance.questionMarkerImage ||
          updatedSettings.assetAppearance.platformImage !== baseSettings.assetAppearance.platformImage
        ) {
          if (questionId === "leaderboard") continue;
          try {
            const questionAsset = await DroppedAsset.create(droppedAssetId, urlSlug, { credentials });
            updatePromises.push(
              questionAsset.updateWebImageLayers(
                updatedSettings.assetAppearance.platformImage,
                updatedSettings.assetAppearance.questionMarkerImage,
              ),
            );
          } catch {
            // Asset may have been manually deleted, skip
          }
        }
      }

      // Update leaderboard asset
      if (
        leaderboardAssetId &&
        updatedSettings.assetAppearance.leaderboardImage !== baseSettings.assetAppearance.leaderboardImage
      ) {
        try {
          const leaderboardAsset = await DroppedAsset.create(leaderboardAssetId, urlSlug, { credentials });
          updatePromises.push(
            leaderboardAsset.updateWebImageLayers(updatedSettings.assetAppearance.leaderboardImage, ""),
          );
        } catch {
          // Asset may have been manually deleted, skip
        }
      }

      await Promise.allSettled(updatePromises);
    }

    // Save settings (and initialize structure if first time)
    const lockId = `${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;

    if (!keyAssetDataObject.settings) {
      // Initialize the full data object structure
      const data = {
        questions: keyAssetDataObject.questions || {},
        settings: updatedSettings,
        droppedAssets: {
          ...(keyAssetDataObject.droppedAssets || {}),
          leaderboard: leaderboardAssetId,
        },
        leaderboard: keyAssetDataObject.leaderboard || {},
      };
      await keyAsset.setDataObject(data, {
        lock: { lockId, releaseLock: true },
        analytics: [
          {
            analyticName: "quizSettingsConfigured",
            profileId,
            uniqueKey: profileId,
            urlSlug,
          },
        ],
      });

      // Store keyAssetId in world data object for scene-scoped lookup
      const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;
      if (!worldDataObject || Object.keys(worldDataObject).length === 0) {
        await world.setDataObject({ [sceneDropId]: { keyAssetId: assetId } });
      } else if (!worldDataObject[sceneDropId]) {
        await world.updateDataObject({ [sceneDropId]: { keyAssetId: assetId } });
      }
    } else {
      await keyAsset.updateDataObject(
        {
          "settings": updatedSettings,
          "droppedAssets.leaderboard": leaderboardAssetId,
        },
        { lock: { lockId, releaseLock: true } },
      );
    }

    // Update start asset
    if (updatedSettings.assetAppearance.startImage !== baseSettings.assetAppearance.startImage) {
      await keyAsset.updateWebImageLayers("", updatedSettings.assetAppearance.startImage);
    }

    const updatedDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    return res.json({
      success: true,
      quiz: updatedDataObject,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleUpdateSettings",
      message: "Error updating settings.",
      req,
      res,
    });
  }
};
