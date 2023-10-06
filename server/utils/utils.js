import { Visitor, DroppedAsset, World } from "./topiaInit.js";
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

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, { credentials });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
    ]);

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
      numberOfAssetsThatBelongToQuiz: allAssetsThatBelongToQuiz?.length,
    };
  } catch (error) {
    console.error("Error getQuestionsAndLeaderboardStartAndAssets", error);
    throw new Error("Error in getQuestionsAndLeaderboardStartAndAssets");
  }
};

export const getHasAnsweredAllQuestions = async (queryParams) => {
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

    const { startAsset, leaderboardAsset, questionAssets } =
      await getQuestionsAndLeaderboardStartAndAssets(queryParams);

    const hasAnsweredAllQuestions = checkAllAnswered(questionAssets);

    return {
      hasAnsweredAllQuestions,
      startAsset,
      leaderboardAsset,
      questionAssets,
    };
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};

export async function getAllAssetsThatBelongsToQuiz(
  quizName,
  urlSlug,
  credentials
) {
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

export function doesStrBelongsToQuiz(assetUniqueName, quizUniqueName) {
  const regex = new RegExp(
    `^${quizUniqueName}-start$|^${quizUniqueName}-question-.*$|^${quizUniqueName}-leaderboard$`
  );

  return regex.test(assetUniqueName);
}

export function getQuizName(str) {
  const parts = str.split("-");
  return parts[0];
}

function getStartAsset(droppedAssets, quizName) {
  return droppedAssets.find((asset) => {
    return asset.uniqueName.startsWith(`${quizName}-start`);
  });
}

export function getLeaderboardAsset(droppedAssets, quizName) {
  return droppedAssets.find((asset) => {
    return asset.uniqueName.startsWith(`${quizName}-leaderboard`);
  });
}

export function getQuestionAssets(droppedAssets, quizName) {
  const regex = new RegExp(`^${quizName}-question-.*`);
  return droppedAssets.filter((asset) => {
    return regex.test(asset.uniqueName);
  });
}

export function checkAllAnswered(droppedAssets) {
  for (let asset of droppedAssets) {
    if (!asset.dataObject.quiz) {
      return false;
    }
    for (let profileId in asset.dataObject.quiz.results) {
      if (
        !asset.dataObject.quiz.results?.[profileId]?.hasOwnProperty(
          "userAnswer"
        )
      ) {
        return false;
      }
    }
  }
  return true;
}
