import { World } from "../topiaInit.js";
export const getDroppedAssets = async (req, res) => {
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

    const world = await World.create(urlSlug, { credentials });

    await world.fetchDroppedAssets();
    const assets = world.droppedAssets;

    const privateZoneAssets = Object.entries(assets)
      .filter(
        ([key, value]) => value.isPrivateZone === true && value.uniqueName
      )
      .map(([key, value]) => value);

    return res.json({ droppedAssets: privateZoneAssets });
  } catch (error) {
    console.error("Error getting the visitor", error);
    return res.status(500).send({ error, success: false });
  }
};
