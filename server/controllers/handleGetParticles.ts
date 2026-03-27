import { Request, Response } from "express";
import { errorHandler, getCredentials, getVisitor, World } from "../utils/index.js";

export const handleGetParticles = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug } = credentials;

    const { visitor } = await getVisitor(credentials, true);
    if (!visitor.isAdmin) throw "User is not an admin.";

    const world = World.create(urlSlug, { credentials });
    const particles = await world.getAllParticles();

    return res.json({ particles });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetParticles",
      message: "Error fetching particles.",
      req,
      res,
    });
  }
};
