import { DroppedAsset } from "./topiaInit.js";
import { Credentials } from "../types/Credentials.js";
import { errorHandler } from "./errorHandler.js";

export const removeQuizAsset = async ({
  credentials,
  droppedAssetId,
}: {
  credentials: Credentials;
  droppedAssetId: string;
}) => {
  const { urlSlug } = credentials;

  try {
    const droppedAsset = await DroppedAsset.create(droppedAssetId, urlSlug, { credentials });
    await droppedAsset.deleteDroppedAsset();
  } catch (error) {
    errorHandler({
      error,
      functionName: "removeQuizAsset",
      message: `Error removing dropped asset ${droppedAssetId}`,
    });
  }
};
