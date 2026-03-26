import { KeyAssetDataObject, VisitorStatusType, WorldDataObjectType } from "../types/index.js";
import { errorHandler, getCredentials, DroppedAsset, World, getVisitor } from "../utils/index.js";
import { Request, Response } from "express";

export const handleTimeoutQuiz = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, urlSlug } = credentials;

    const { visitor, playerStatus } = await getVisitor(credentials);
    const { startTime, endTime } = playerStatus;

    // Already completed — nothing to do
    if (endTime) {
      return res.json({ quiz: null, playerStatus });
    }

    if (!startTime) throw "Quiz has not been started.";

    const world = World.create(urlSlug, { credentials });
    const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;

    const keyAsset = await DroppedAsset.get(worldDataObject[sceneDropId].keyAssetId, urlSlug, {
      credentials,
    });
    await keyAsset.fetchDataObject();
    const { questions, settings } = keyAsset.dataObject as KeyAssetDataObject;

    if (!settings?.timerDurationMinutes) throw "Quiz does not have a time limit.";

    // Verify time has actually elapsed
    const elapsed = Date.now() - new Date(startTime).getTime();
    const limitMs = settings.timerDurationMinutes * 60 * 1000;
    if (elapsed < limitMs - 5000) {
      // Allow 5s tolerance for network delay
      throw "Time has not expired yet.";
    }

    const now = new Date();

    // Mark all unanswered questions as wrong
    const updatedStatus: VisitorStatusType = { ...playerStatus };
    for (const questionId of Object.keys(questions)) {
      if (!updatedStatus.answers[questionId]) {
        updatedStatus.answers[questionId] = {
          answer: "",
          isCorrect: false,
        };
      }
    }

    // Cap endTime and timeElapsed to the timer limit so the result reflects the allowed duration
    const timerLimitMs = settings.timerDurationMinutes * 60 * 1000;
    const endTimeDate = new Date(new Date(startTime).getTime() + timerLimitMs);
    const minutes = Math.floor(timerLimitMs / 60000);
    const seconds = ((timerLimitMs % 60000) / 1000).toFixed(0);
    updatedStatus.endTime = endTimeDate;
    updatedStatus.timeElapsed = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");

    let score = 0;
    for (const qId in updatedStatus.answers) {
      if (updatedStatus.answers[qId].isCorrect) score++;
    }

    let quizzesCompleted = (visitor.dataObject as { quizzesCompleted?: number })?.quizzesCompleted || 0;
    quizzesCompleted += 1;

    const promises = [];

    promises.push(
      keyAsset.updateDataObject(
        {
          [`leaderboard.${profileId}`]: `${displayName}|${score}|${updatedStatus.timeElapsed}|${now.toISOString()}|${Object.keys(updatedStatus.answers).length}|Y`,
        },
        {
          analytics: [
            {
              analyticName: "completions",
              profileId,
              uniqueKey: profileId,
              urlSlug,
            },
            {
              analyticName: "timeouts",
              profileId,
              uniqueKey: profileId,
              urlSlug,
            },
          ],
        },
      ),
    );

    promises.push(
      visitor.updateDataObject(
        { quizzesCompleted, [`${urlSlug}-${sceneDropId}`]: updatedStatus },
        {
          analytics: [
            {
              analyticName: "quizTimedOut",
              profileId,
              uniqueKey: profileId,
              urlSlug,
            },
          ],
        },
      ),
    );

    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === "rejected") console.error(result.reason);
    });

    const keyAssetDataObject = (await keyAsset.fetchDataObject()) as KeyAssetDataObject;

    return res.json({
      quiz: keyAssetDataObject,
      playerStatus: updatedStatus,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleTimeoutQuiz",
      message: "Error handling quiz timeout.",
      req,
      res,
    });
  }
};
