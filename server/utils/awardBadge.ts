import { Credentials } from "../types";
import {  getCachedInventoryItems, standardizeError } from "./index.js";

export const awardBadge = async ({
  credentials,
  visitor,
  visitorInventory,
  badgeName,
}: {
  credentials: Credentials;
  visitor: any;
  visitorInventory: any;
  badgeName: string;
}) => {
  try {
    if (visitorInventory[badgeName]) return { success: true };

    const inventoryItems = await getCachedInventoryItems({ credentials });

    const inventoryItem = inventoryItems?.find((item) => item.name === badgeName);
    if (!inventoryItem) throw new Error(`Inventory item ${badgeName} not found in ecosystem`);

    await visitor.grantInventoryItem(inventoryItem, 1);

    await visitor
      .fireToast({
        title: "Badge Awarded",
        text: `You have earned the ${badgeName} badge!`,
      })
      .catch(() => console.error(`Failed to fire toast after awarding the ${badgeName} badge.`));

    return { success: true };
  } catch (error) {
    throw standardizeError(error);
  }
};
