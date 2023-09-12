import { Visitor, DroppedAsset, World } from "../topiaInit.js";
export const getAllAssetsThatBelongsToQuiz = async ( => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });

    const now = Date.now();

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    let startDroppedAsset;

    if (isStartAsset(droppedAsset?.uniqueName)) {
      startDroppedAsset = droppedAsset;
    } else {
      const quizName = getLastWord(droppedAsset?.uniqueName);
      startDroppedAsset = await getStartDroppedAsset(
        quizName,
        urlSlug,
        credentials
      );
    }

    await startDroppedAsset.fetchDataObject();

    return res.json({
      startTimestamp:
        startDroppedAsset?.dataObject.quiz?.[visitor?.profileId]
          ?.startTimestamp,
    });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};

function isStartAsset(str) {
  return str.startsWith("start-");
}

function getLastWord(str) {
  const parts = str.split("-");
  return parts[parts.length - 1];
}

function belongsToQuiz(assetUniqueName, quizUniqueName) {
  const regex = new RegExp(
    `^-?\\w+-belongsTo-${quizUniqueName}$|^start-${quizUniqueName}$`
  );

  return regex.test(assetUniqueName);
}

async function getStartDroppedAsset(quizName, urlSlug, credentials) {
  const world = await World.create(urlSlug, { credentials });

  await world.fetchDroppedAssets();
  const assets = world.droppedAssets;

  const assetsThatBelongsToQuiz = Object.entries(assets)
    .filter(([key, value]) => {
      return belongsToQuiz(value.uniqueName, quizName);
    })
    .map(async ([key, value]) => {
      await value.fetchDataObject();
      return value;
    });

  const result = await Promise.all(assetsThatBelongsToQuiz);

  const startAsset = result.filter((da) => {
    return isStartAsset(da.uniqueName);
  });

  return startAsset?.[0];
}
