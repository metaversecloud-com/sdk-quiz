import { Visitor, World } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "../utils.js";
export const getTimestamp = async (req, res) => {
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

    const { startAsset } = await getQuestionsAndLeaderboardStartAndAssets(
      req.query
    );

    return res.json({
      startTimestamp:
        startAsset?.dataObject?.quiz?.[visitor?.profileId]?.startTimestamp,
    });
  } catch (error) {
    console.error(
      "❌ ⌛ Error while getTimestamp: ",
      { requestId: req.id, reqQuery: req.query, reqBody: req.body },
      JSON.stringify(error)
    );
    return res.status(500).json({ error: error?.message, success: false });
  }
};

function isStartAsset(str) {
  return str?.startsWith("start-");
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
