import { Visitor, DroppedAsset, World } from "../topiaInit.js";
export const getQuestionsAndLeaderboardStartAndAssets = async (queryParams) => {
  try {
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

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials,
    });

    const quizName = getQuizName(droppedAsset?.uniqueName);

    const allAssetsThatBelongToQuiz = await getAllAssetsThatBelongsToQuiz(
      quizName,
      urlSlug,
      credentials
    );

    const startAsset = getStartAsset(allAssetsThatBelongToQuiz, quizName);
    const leaderboardAsset = getLeaderboardAsset(
      allAssetsThatBelongToQuiz,
      quizName
    );
    const questionAssets = getQuestionAssets(
      allAssetsThatBelongToQuiz,
      quizName
    );

    return {
      startAsset,
      leaderboardAsset,
      questionAssets,
    };
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};

async function getAllAssetsThatBelongsToQuiz(quizName, urlSlug, credentials) {
  const world = await World.create(urlSlug, { credentials });

  await world.fetchDroppedAssets();
  const assets = world.droppedAssets;

  const assetsThatBelongsToQuiz = Object.entries(assets)
    .filter(([key, value]) => {
      return doesStrBelongsToQuiz(value.uniqueName, quizName);
    })
    .map(async ([key, value]) => {
      await value.fetchDataObject();
      return value;
    });

  const result = await Promise.all(assetsThatBelongsToQuiz);

  return result;
}

function doesStrBelongsToQuiz(assetUniqueName, quizUniqueName) {
  const regex = new RegExp(
    `^start-${quizUniqueName}$|^question-.*-${quizUniqueName}$|^leaderboard-${quizUniqueName}$`
  );

  return regex.test(assetUniqueName);
}

function getQuizName(str) {
  const parts = str.split("-");
  return parts[parts.length - 1];
}

function getStartAsset(droppedAssets, quizName) {
  return droppedAssets.find((asset) => {
    return asset.uniqueName.startsWith(`start-${quizName}`);
  });
}

function getLeaderboardAsset(droppedAssets, quizName) {
  return droppedAssets.find((asset) => {
    return asset.uniqueName.startsWith(`leaderboard-${quizName}`);
  });
}

function getQuestionAssets(droppedAssets, quizName) {
  const regex = new RegExp(`^question-.*-${quizName}$`);
  return droppedAssets.filter((asset) => {
    return regex.test(asset.uniqueName);
  });
}
