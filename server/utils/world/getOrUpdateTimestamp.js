/**
 * This module provides an endpoint function `updateTimestamp` that updates or fetches
 * the start timestamp of a quiz associated with a specific dropped asset in the Topia platform.
 * The timestamp is used to track the time that each user spends on the quiz
 */

import { Visitor, DroppedAsset } from "../topiaInit.js";
export const getOrUpdateTimestamp = async (req, res) => {
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
      startDroppedAsset = getStartDroppedAsset();
    }

    await startDroppedAsset.fetchDataObject();

    if (!startDroppedAsset?.dataObject?.quiz) {
      startDroppedAsset.dataObject.quiz = {};
    }
    if (!startDroppedAsset?.dataObject?.quiz?.[visitor?.profileId]) {
      startDroppedAsset.dataObject.quiz[visitor.profileId] = {};
      startDroppedAsset.dataObject.quiz[visitor.profileId].startTimestamp = now;
      startDroppedAsset.updateDataObject();
    }

    return res.json({
      startTimestamp:
        startDroppedAsset?.dataObject.quiz[visitor?.profileId].startTimestamp,
    });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};

function isStartAsset(str) {
  return str.startsWith("start-");
}
