/**
 * This module provides an endpoint function `updateTimestamp` that updates or fetches
 * the start timestamp of a quiz associated with a specific dropped asset in the Topia platform.
 * The timestamp is used to track the time that each user spends on the quiz
 */

import { Visitor, DroppedAsset } from "../topiaInit.js";
import { getQuestionsAndLeaderboardStartAndAssets } from "./getQuestionsAndLeaderboardStartAndAssets.js";
export const updateTimestamp = async (req, res) => {
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

    const { startAsset } = await getQuestionsAndLeaderboardStartAndAssets(
      req.query
    );
    await startAsset.fetchDataObject();

    if (!startAsset?.dataObject?.quiz) {
      startAsset.dataObject.quiz = {};
    }

    startAsset.dataObject.quiz[visitor.profileId] = {};
    startAsset.dataObject.quiz[visitor.profileId].startTimestamp = now;
    startAsset.updateDataObject();

    return res.json({
      startTimestamp:
        startAsset?.dataObject.quiz[visitor?.profileId].startTimestamp,
    });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
