import { KeyAssetDataObject, VisitorStatusType, WorldDataObjectType } from "../types/index.js";
import {
  errorHandler,
  getCredentials,
  DroppedAsset,
  World,
  getVisitor,
  awardBadge,
  sortLeaderboard,
} from "../utils/index.js";
import { Request, Response } from "express";

export const handleAnswerQuestion = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, profileId, sceneDropId, urlSlug } = credentials;

    const { isCorrect, selectedOption } = req.body;

    const promises = [];

    const { questionId } = req.params;
    if (!questionId) throw "Question id is required.";

    const getVisitorResponse = await getVisitor(credentials);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor, playerStatus, visitorInventory } = getVisitorResponse;
    const { answers, endTime, startTime } = playerStatus;
    let quizzesCompleted = (visitor.dataObject as { quizzesCompleted?: number })?.quizzesCompleted || 0;

    const world = World.create(urlSlug, { credentials });
    const worldDataObject = (await world.fetchDataObject()) as WorldDataObjectType;

    const keyAsset = await DroppedAsset.get(worldDataObject[sceneDropId].keyAssetId, urlSlug, {
      credentials,
    });
    await keyAsset.fetchDataObject();
    const { leaderboard, questions } = keyAsset.dataObject as KeyAssetDataObject;

    const now = new Date();
    const numberOfQuestions = Object.keys(questions).length;
    const hasAnsweredAll = Object.keys(answers).length === numberOfQuestions - 1;

    const durationMs = new Date(endTime || now).getTime() - new Date(startTime || now).getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);

    const updatedStatus: VisitorStatusType = playerStatus;
    updatedStatus.answers[questionId] = { answer: selectedOption, isCorrect };
    updatedStatus.endTime = hasAnsweredAll ? now : null;
    updatedStatus.timeElapsed = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");

    if (hasAnsweredAll) {
      quizzesCompleted += 1;

      let score = 0;
      for (const questionId in answers) {
        if (answers[questionId].isCorrect) score++;
      }

      promises.push(
        keyAsset.updateDataObject(
          {
            [`leaderboard.${profileId}`]: `${displayName}|${score}|${updatedStatus.timeElapsed}`,
          },
          {
            analytics: [
              {
                analyticName: "completions",
                profileId,
                uniqueKey: profileId,
                urlSlug,
              },
            ],
          },
        ),
      );

      promises.push(
        visitor
          .triggerParticle({
            name: "partyPopper_float",
            duration: 5,
          })
          .catch((error: any) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error triggering particle effects",
            }),
          ),
      );

      // Award Perfect Score badge if all answers are correct
      if (score === numberOfQuestions) {
        promises.push(
          awardBadge({
            credentials,
            visitor,
            visitorInventory,
            badgeName: "Perfect Score",
          }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error awarding Perfect Score badge",
            }),
          ),
        );
      }

      // Award Lightning Round badge if quiz is finished under 30 seconds
      if (durationMs <= 30000) {
        promises.push(
          awardBadge({
            credentials,
            visitor,
            visitorInventory,
            badgeName: "Lightning Round",
          }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error awarding Lightning Round badge",
            }),
          ),
        );
      }

      // Award Quiz Master badge if 10 quizzes have been completed
      if (quizzesCompleted === 10) {
        promises.push(
          awardBadge({
            credentials,
            visitor,
            visitorInventory,
            badgeName: "Quiz Master",
          }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error awarding Quiz Master badge",
            }),
          ),
        );
      }

      // Award Top 3 Finisher badge if player is in top 3 of leaderboard
      leaderboard[profileId] = `${displayName}|${score}|${updatedStatus.timeElapsed}`;
      const sortedLeaderboard = sortLeaderboard(leaderboard);
      // Get the top 3 profileIds from the sorted leaderboard
      const top3ProfileIds = sortedLeaderboard.slice(0, 3).map((entry) => entry.profileId);
      if (top3ProfileIds.includes(profileId)) {
        promises.push(
          awardBadge({
            credentials,
            visitor,
            visitorInventory,
            badgeName: "Top 3 Finisher",
          }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error awarding Top 3 Finisher badge",
            }),
          ),
        );
      }
    }

    if (isCorrect) {
      const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
      promises.push(
        world
          .triggerParticle({
            name: "brain_float",
            duration: 3,
            position: droppedAsset.position,
          })
          .catch((error: any) =>
            errorHandler({
              error,
              functionName: "handleAnswerQuestion",
              message: "Error triggering particle effects",
            }),
          ),
      );
    }

    promises.push(
      visitor.updateDataObject(
        { quizzesCompleted, [`${urlSlug}-${sceneDropId}`]: updatedStatus },
        {
          analytics: [
            {
              analyticName: `question${questionId}Answered`,
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
      functionName: "handleAnswerQuestion",
      message: "Error answering question.",
      req,
      res,
    });
  }
};
