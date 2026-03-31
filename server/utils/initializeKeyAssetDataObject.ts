import { KeyAssetInterface } from "../types/KeyAssetTypes.js";
import { errorHandler } from "./errorHandler.js";

export const initializeKeyAssetDataObject = async (keyAsset: KeyAssetInterface) => {
  try {
    await keyAsset.fetchDataObject();

    // If this is a configured quiz (has settings), don't auto-populate
    if (keyAsset?.dataObject?.settings) return;

    // Initialize with empty data object if none exists
    if (!keyAsset?.dataObject?.questions) {
      const lockId = `${keyAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset.setDataObject(
        {
          questions: {},
        },
        { lock: { lockId, releaseLock: true } },
      );
    }

    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeKeyAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await keyAsset.fetchDataObject();
  }
};
