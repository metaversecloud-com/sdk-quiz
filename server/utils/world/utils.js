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

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, { credentials });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
    ]);

    console.log(droppedAsset.uniqueName, droppedAsset.dataObject);

    const quizName = getQuizName(droppedAsset?.uniqueName);

    // Use partial search to get all the assets the belongs to the quiz
    // world.fetchDroppedAssetsWithUniqueName("math_quiz1_", true)

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
    console.error("Error getQuestionsAndLeaderboardStartAndAssets", error);
    return res.status(500).send({ error, success: false });
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

function checkAllAnswered(droppedAssets) {
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

export const getMainQuizAsset = async (queryParams) => {
  // try {
  //   const {
  //     visitorId,
  //     interactiveNonce,
  //     assetId,
  //     interactivePublicKey,
  //     urlSlug,
  //   } = queryParams;
  //   const credentials = {
  //     assetId,
  //     interactiveNonce,
  //     interactivePublicKey,
  //     visitorId,
  //   };
  //   const world = await World.create(urlSlug, { credentials });
  //   const { startAsset, leaderboardAsset, questionAssets } =
  //     await getQuestionsAndLeaderboardStartAndAssets(queryParams);
  //   const hasAnsweredAllQuestions = checkAllAnswered(questionAssets);
  //   return {
  //     hasAnsweredAllQuestions,
  //     startAsset,
  //     leaderboardAsset,
  //     questionAssets,
  //   };
  // } catch (error) {
  //   console.error("Error getting the visitor", error);
  //   return res.status(500).send({ error, success: false });
  // }
};
