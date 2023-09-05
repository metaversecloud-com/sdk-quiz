import express from "express";
import { getDroppedAssets, getVisitor } from "./utils/index.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/dropped-asset", getDroppedAssets);
router.get("/visitor", getVisitor);

export default router;
