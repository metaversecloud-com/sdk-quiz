import { Visitor } from "../topiaInit.js";
import { Credentials, VisitorDataObjectType } from "../../types/index.js";
import { VisitorInterface } from "@rtsdk/topia";
import { defaultVisitorStatus } from "../../constants.js";

export const getVisitor = async (credentials: Credentials, shouldGetVisitorDetails = false) => {
  try {
    const { sceneDropId, urlSlug, visitorId } = credentials;

    let visitor: VisitorInterface;
    if (shouldGetVisitorDetails) visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    else visitor = await Visitor.create(visitorId, urlSlug, { credentials });

    if (!visitor) throw "Not in world";

    const dataObject = (await visitor.fetchDataObject()) as VisitorDataObjectType;

    const playerStatus = dataObject?.[`${urlSlug}-${sceneDropId}`] || defaultVisitorStatus;

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!dataObject) {
      await visitor.setDataObject(
        {
          [`${urlSlug}-${sceneDropId}`]: playerStatus,
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!dataObject[`${urlSlug}-${sceneDropId}`]) {
      await visitor.updateDataObject(
        { [`${urlSlug}-${sceneDropId}`]: playerStatus },
        { lock: { lockId, releaseLock: true } },
      );
    }

    return { visitor, playerStatus };
  } catch (error: any) {
    return new Error(error);
  }
};
