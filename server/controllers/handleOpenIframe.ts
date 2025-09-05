import { errorHandler, getVisitor, getCredentials } from "../utils/index.js";
import { Request, Response } from "express";

export const handleOpenIframe = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.body);
    const { assetId, interactiveNonce, interactivePublicKey, uniqueName, urlSlug, visitorId } = credentials;

    const { iframeId } = req.params;
    const isStart = iframeId === "start" || uniqueName === "start";

    const getVisitorResponse = await getVisitor(credentials);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor } = getVisitorResponse;
    await visitor.closeIframe(assetId).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handleOpenIframe",
        message: "Error closing iframe",
      }),
    );

    const origin = process.env.NODE_ENV === "development" ? process.env.NGROK_URL : `https://${req.hostname}`;
    const pageName = isStart ? "start" : "question";
    let link = `${origin}/${pageName}?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;
    if (!isStart) link += `&questionId=${iframeId || uniqueName}`;

    visitor
      .openIframe({
        droppedAssetId: assetId,
        link,
        shouldOpenInDrawer: true,
        title: "Quiz Race",
      })
      .catch((error: any) =>
        errorHandler({
          error,
          functionName: "handleOpenIframe",
          message: "Error opening iframe",
        }),
      );

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({ error, functionName: "handleOpenIframe", message: "Error opening iframe.", req, res });
  }
};
