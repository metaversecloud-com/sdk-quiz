import { DroppedAsset, Visitor, World } from "../topiaInit.js";

export async function getStartAsset(queryParams) {
  const {
    visitorId,
    interactiveNonce,
    assetId,
    interactivePublicKey,
    urlSlug,
  } = queryParams;

  const credentials = {
    assetId,
    interactiveNonce,
    interactivePublicKey,
    visitorId,
  };

  const droppedAssetPromise = DroppedAsset.get(assetId, urlSlug, {
    credentials,
  });

  const visitorPromise = Visitor.get(visitorId, urlSlug, {
    credentials: {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    },
  });

  const result = await Promise.all([droppedAssetPromise, visitorPromise]);

  const questionDroppedAsset = result?.[0];
  const visitor = result?.[1];

  const quizName = getQuizName(questionDroppedAsset?.uniqueName);

  const world = await World.create(urlSlug, { credentials });

  const startAssetUniqueName = `start-${quizName}`;

  const startAssetArr = await world.fetchDroppedAssetsWithUniqueName({
    uniqueName: startAssetUniqueName,
    isPartial: false,
  });

  const startDroppedAsset = startAssetArr?.[0];

  return { startDroppedAsset, visitor, questionDroppedAsset };
}

function getQuizName(str) {
  const parts = str?.split("-");
  return parts[parts.length - 1];
}
